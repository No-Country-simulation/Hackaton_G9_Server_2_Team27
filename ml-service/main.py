from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
from collections import Counter
import time
import sys
import os

app = FastAPI(title="EnergiAI ML Ensamble (4 Modelos)", version="1.0.0")

from download_models import descargar_desde_oci
descargar_desde_oci()

# ==========================================
# 1. ESQUEMA DE ENTRADA (contrato con Java)
# ==========================================
class EnergyRequest(BaseModel):
    consumo_kwh: float
    uso_horario_pico: bool
    cantidad_equipos: int
    tipo_inmueble: str
    horas_alto_consumo: int
    metros_cuadrados: float = None
    cantidad_personas: int = None


# ==========================================
# 2. CARGA DE LOS 4 MODELOS ENTRENADOS
# ==========================================
def load_model(nombre_archivo):
    ruta = os.path.join("modelos", nombre_archivo)
    if not os.path.exists(ruta):
        raise FileNotFoundError(f"No se encontró el modelo: {ruta}")
    return joblib.load(ruta)


try:
    model_xgb = load_model('energia_pipeline_mvp.pkl')
    model_logreg = load_model('modelo_clasificacion_pipeline_mvp.pkl')
    model_knn = load_model('modelo_knn_pipeline.pkl')
    model_rf = load_model('modelo_random_forest.joblib')
    print("✅ Los 4 modelos de ensamble han sido cargados correctamente en memoria.")
except Exception as e:
    print(f"❌ Error crítico al cargar los artefactos: {e}")
    sys.exit(1)

TARGET_MAPPING = {0: 'Eficiente', 1: 'Moderado', 2: 'Ineficiente'}


# ==========================================
# 3. CONSTRUCCIÓN DE LOS DATAFRAMES DE ENTRADA
# ==========================================
def construir_dataframes(data: EnergyRequest):
    datos_base = {
        'consumo_kwh': data.consumo_kwh,
        'uso_horario_pico': data.uso_horario_pico,
        'cantidad_equipos': data.cantidad_equipos,
        'horas_alto_consumo': data.horas_alto_consumo
    }

    tipo_inmueble_inferencia = data.tipo_inmueble
    if tipo_inmueble_inferencia.lower() in ["pequeña empresa", "pequeñas empresas"]:
        # Fallback seguro para evitar error de Unknown Category en Scikit-Learn
        tipo_inmueble_inferencia = "Comercial" # O el valor genérico soportado

    # XGBoost, Regresion Logistica y KNN esperan "tipo_vivienda"
    df_vivienda = pd.DataFrame([{**datos_base, 'tipo_vivienda': tipo_inmueble_inferencia}])

    # Random Forest esperan "tipo_inmueble" (nombre distinto, mismo dato)
    df_inmueble = pd.DataFrame([{**datos_base, 'tipo_inmueble': tipo_inmueble_inferencia}])

    return df_vivienda, df_inmueble


# ==========================================
# 4. UNA PREDICCIÓN INDIVIDUAL, CON SU PROBABILIDAD REAL
# ==========================================
def predecir_con_tiempo(modelo, df):
    t0 = time.time()
    
    print("\n" + "="*40)
    print(f"🔍 DEBUGGING ML INFERENCE")
    print(f"Modelo tipo: {type(modelo).__name__}")
    print(f"Columnas enviadas: {df.columns.tolist()}")
    print(f"Valores exactos (DataFrame):\n{df.to_string(index=False)}")
    
    try:
        proba = modelo.predict_proba(df)
        print(f"🎯 Probabilidades (predict_proba): {proba}")
    except Exception as e:
        print(f"⚠️ Advertencia predict_proba falló: {e}")
        
    prediccion = int(modelo.predict(df)[0])
    print(f"🧠 Predicción (predict) mapeada a clase: {prediccion} ({TARGET_MAPPING.get(prediccion, 'Desconocido')})")
    print("="*40 + "\n")
    
    probabilidad = float(modelo.predict_proba(df)[0][prediccion])
    duracion_ms = (time.time() - t0) * 1000
    return prediccion, probabilidad, duracion_ms


# ==========================================
# 5. ENDPOINTS
# ==========================================
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analisis-energetico")
def predict_ensamble(data: EnergyRequest):
    df_vivienda, df_inmueble = construir_dataframes(data)

    try:
        pred_xgb, prob_xgb, t_xgb = predecir_con_tiempo(model_xgb, df_vivienda)
        pred_logreg, prob_logreg, t_logreg = predecir_con_tiempo(model_logreg, df_vivienda)
        pred_knn, prob_knn, t_knn = predecir_con_tiempo(model_knn, df_vivienda)
        pred_rf, prob_rf, t_rf = predecir_con_tiempo(model_rf, df_inmueble)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo en la inferencia del ensamble: {str(e)}")

    # ==========================================
    # 6. VOTACIÓN POR MAYORÍA + DESEMPATE
    # ==========================================
    votos = [pred_xgb, pred_logreg, pred_knn, pred_rf]
    conteo = Counter(votos)
    mas_votados = conteo.most_common()

    probabilidades_por_prediccion = {
        pred_xgb: prob_xgb,
        pred_logreg: prob_logreg,
        pred_knn: prob_knn,
        pred_rf: prob_rf
    }

    if len(mas_votados) > 1 and mas_votados[0][1] == mas_votados[1][1]:
        prediccion_final = pred_xgb
        metodo = f"Desempate por modelo principal XGBoost ({mas_votados[0][1]} vs {mas_votados[1][1]})"
    else:
        prediccion_final = mas_votados[0][0]
        metodo = f"Consenso por mayoría ({mas_votados[0][1]}/4 votos)"

    probabilidad_final = probabilidades_por_prediccion[prediccion_final]

    nombres_pred = {
        "XGBoost": TARGET_MAPPING[pred_xgb],
        "Regresion Logistica": TARGET_MAPPING[pred_logreg],
        "KNN": TARGET_MAPPING[pred_knn],
        "Random Forest": TARGET_MAPPING[pred_rf]
    }

    # ==========================================
    # 7. RESPUESTA FINAL
    # ==========================================
    return {
        "categoria": TARGET_MAPPING[prediccion_final],
        "probabilidad": round(probabilidad_final, 4),
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