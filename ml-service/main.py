from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
from collections import Counter
import time
import sys
import os

app = FastAPI(title="EnergiAI ML Ensamble (4 Modelos)", version="2.1.0")

# ==========================================
# 1. CARGA DE LOS 4 ARTEFACTOS .PKL
# ==========================================
def load_model(name):
    # Intentamos cargar desde la raíz o desde la carpeta 'modelos'
    for path in [name, os.path.join("modelos", name)]:
        if os.path.exists(path):
            return joblib.load(path)
    raise FileNotFoundError(f"No se encontró el modelo {name} en el directorio raíz ni en 'modelos/'.")

try:
    model_xgb = load_model('energia_pipeline_mvp.pkl')            # XGBoost
    model_logreg = load_model('modelo_regresion_logistica.pkl')    # Regresión Logística
    model_knn = load_model('modelo_knn.pkl')                      # KNN
    model_rf = load_model('modelo_random_forest.pkl')             # Random Forest
    print("✅ Los 4 modelos de ensamble han sido cargados correctamente en memoria.")
except Exception as e:
    print(f"❌ Error crítico al cargar los artefactos .pkl: {e}")
    sys.exit(1)

# ==========================================
# 2. ESQUEMA DE ENTRADA (Contrato con Java)
# ==========================================
class EnergyRequest(BaseModel):
    consumoKwh: float
    usoHorarioPico: bool
    cantidadEquipos: int
    tipoInmueble: str
    horasAltoConsumo: int
    metrosCuadrados: float = None  # Se recibe pero no entra a los pipelines
    cantidadPersonas: int = None   # Se recibe pero no entra a los pipelines

TARGET_MAPPING = {0: 'Eficiente', 1: 'Moderado', 2: 'Ineficiente'}

# ==========================================
# 3. ENDPOINT PRINCIPAL DE INFERENCIA
# ==========================================
@app.post("/analisis-energetico")
def predict_ensamble(data: EnergyRequest):
    # Dataframe con las 5 variables exactas requeridas por la arquitectura
    input_df = pd.DataFrame([{
        'consumo_kwh': data.consumoKwh,
        'uso_horario_pico': data.usoHorarioPico,
        'cantidad_equipos': data.cantidadEquipos,
        'tipo_vivienda': data.tipoInmueble,
        'horas_alto_consumo': data.horasAltoConsumo
    }])

    try:
        # 1. XGBoost
        t0 = time.time()
        pred_xgb = int(model_xgb.predict(input_df)[0])
        prob_xgb = float(model_xgb.predict_proba(input_df)[0].max())
        t_xgb = (time.time() - t0) * 1000

        # 2. Regresión Logística
        t0 = time.time()
        pred_logreg = int(model_logreg.predict(input_df)[0])
        t_logreg = (time.time() - t0) * 1000

        # 3. KNN
        t0 = time.time()
        pred_knn = int(model_knn.predict(input_df)[0])
        t_knn = (time.time() - t0) * 1000

        # 4. Random Forest
        t0 = time.time()
        pred_rf = int(model_rf.predict(input_df)[0])
        t_rf = (time.time() - t0) * 1000

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo en la inferencia del ensamble: {str(e)}")

    # ==========================================
    # 4. MOTOR DE VOTACIÓN Y DESEMPATE
    # ==========================================
    votos = [pred_xgb, pred_logreg, pred_knn, pred_rf]
    conteo = Counter(votos)
    mas_votados = conteo.most_common()

    # Si hay un empate en el primer lugar (ej. 2 votos para X y 2 votos para Y)
    if len(mas_votados) > 1 and mas_votados[0][1] == mas_votados[1][1]:
        prediccion_final = pred_xgb  # Criterio de desempate: XGBoost (modelo con mayor F1)
        metodo = f"Desempate por modelo principal XGBoost ({mas_votados[0][1]} vs {mas_votados[1][1]})"
    else:
        prediccion_final = mas_votados[0][0]
        metodo = f"Consenso por mayoría ({mas_votados[0][1]}/4 votos)"

    nombres_pred = {
        "XGBoost": TARGET_MAPPING[pred_xgb],
        "Regresion Logistica": TARGET_MAPPING[pred_logreg],
        "KNN": TARGET_MAPPING[pred_knn],
        "Random Forest": TARGET_MAPPING[pred_rf]
    }

    # ==========================================
    # 5. CONSTRUCCIÓN DE LA RESPUESTA JSON
    # ==========================================
    return {
        "categoria": TARGET_MAPPING[prediccion_final],
        "probabilidad": round(prob_xgb, 4) if prediccion_final == pred_xgb else 0.8500,
        "costo_estimado_mensual": data.consumoKwh * 0.75,
        "detalles": {
            "votos_detallados": nombres_pred,
            "metodo_decision": metodo,
            "latencias_ms": {
                "xgboost_ms": round(t_xgb, 2),
                "regresion_logistica_ms": round(t_logreg, 2),
                "knn_ms": round(t_knn, 2),
                "random_forest_ms": round(t_rf, 2)
            }
        }
    }
