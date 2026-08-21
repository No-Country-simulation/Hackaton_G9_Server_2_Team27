from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from collections import Counter
import time
import sys
import os
import logging

# Configurar logging estructurado
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("uvicorn.info")

app = FastAPI(title="EnergiAI ML Ensamble (4 Modelos)", version="1.0.0")

from download_models import descargar_desde_oci
# Se comenta descargar_desde_oci() si los modelos ya fueron descargados, o se deja para que siempre asegure que están ahí.
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
# 2. CARGA DE ARTEFACTOS (MODELOS COMO PIPELINES)
# ==========================================
def load_artifact(nombre_archivo):
    ruta = os.path.join("modelos", nombre_archivo)
    if not os.path.exists(ruta):
        raise FileNotFoundError(f"No se encontró el artefacto: {ruta}")
    return joblib.load(ruta)

try:
    # Modelos (Ya incluyen Pipeline de preprocesamiento interno)
    model_xgb = load_artifact('energia_pipeline_mvp.pkl')
    model_logreg = load_artifact('modelo_clasificacion_pipeline_mvp.pkl')
    model_knn = load_artifact('modelo_knn_pipeline.pkl')
    model_rf = load_artifact('modelo_random_forest.joblib')
    
    logger.info("✅ Los 4 pipelines de ensamble han sido cargados correctamente en memoria.")
        
except Exception as e:
    logger.error(f"❌ Error crítico al cargar los artefactos: {e}")
    sys.exit(1)

TARGET_MAPPING = {0: 'Eficiente', 1: 'Moderado', 2: 'Ineficiente'}

# ==========================================
# 3. EXTRACCIÓN DE ORDEN DE COLUMNAS
# ==========================================
def get_expected_columns(modelo):
    """
    Intenta extraer la propiedad feature_names_in_ de un Pipeline de sklearn.
    """
    if hasattr(modelo, "feature_names_in_"):
        return modelo.feature_names_in_.tolist()
    
    # Si es un pipeline, buscar en el primer step (usualmente el ColumnTransformer)
    if hasattr(modelo, "steps"):
        ct = modelo.steps[0][1]
        if hasattr(ct, "feature_names_in_"):
            return ct.feature_names_in_.tolist()
            
    # Fallback genérico si no se encuentra (caso muy raro)
    return ['consumo_kwh', 'uso_horario_pico', 'cantidad_equipos', 'tipo_vivienda', 'horas_alto_consumo']

# ==========================================
# 4. CONSTRUCCIÓN DEL DATAFRAME EXACTO
# ==========================================
def alinear_dataframe(df_crudo, expected_cols):
    """
    Toma un DataFrame crudo con todas las posibles variables y devuelve un 
    DataFrame filtrado y ordenado EXACTAMENTE según expected_cols.
    """
    df_aligned = df_crudo.copy()
    
    # Manejo dinámico si espera tipo_vivienda en vez de tipo_inmueble
    if 'tipo_vivienda' in expected_cols and 'tipo_inmueble' in df_aligned.columns:
        df_aligned['tipo_vivienda'] = df_aligned['tipo_inmueble']
        
    for col in expected_cols:
        if col not in df_aligned.columns:
            logger.warning(f"Falta columna esperada {col}, rellenando con 0/None")
            df_aligned[col] = 0
            
    return df_aligned[expected_cols]

# ==========================================
# 5. PREDICCIÓN INDIVIDUAL CON LOGS
# ==========================================
def predecir_con_tiempo(modelo, data: EnergyRequest, nombre_modelo):
    t0 = time.time()
    
    # 5.1 Construir raw payload
    raw_dict = {
        'consumo_kwh': [data.consumo_kwh],
        'cantidad_equipos': [data.cantidad_equipos],
        'horas_alto_consumo': [data.horas_alto_consumo],
        'metros_cuadrados': [data.metros_cuadrados if data.metros_cuadrados is not None else 100],
        'cantidad_personas': [data.cantidad_personas if data.cantidad_personas is not None else 3],
        'tipo_inmueble': [data.tipo_inmueble],
        'uso_horario_pico': [bool(data.uso_horario_pico)]
    }
    
    # Mapear Comercial a "Pequeño Comercio" (que es como se entrenó el modelo)
    if raw_dict['tipo_inmueble'][0].lower() in ["comercial", "pequeña empresa", "pequeñas empresas"]:
        raw_dict['tipo_inmueble'][0] = "Pequeño Comercio"
        
    df_crudo = pd.DataFrame(raw_dict)
    
    # 5.2 Alinear estricto al pipeline
    expected_features = get_expected_columns(modelo)
    df_to_predict = alinear_dataframe(df_crudo, expected_features)
    
    logger.info(f"[{nombre_modelo}] Features inyectadas ({len(expected_features)}): {expected_features}")
    
    try:
        proba = modelo.predict_proba(df_to_predict)[0]
        prob_rounded = [round(p, 4) for p in proba]
        logger.info(f"[{nombre_modelo}] Probabilidades: {prob_rounded}")
    except Exception as e:
        logger.warning(f"[{nombre_modelo}] predict_proba falló: {e}")
        proba = [0, 0, 0] # fallback
        
    try:
        prediccion = int(modelo.predict(df_to_predict)[0])
    except Exception as e:
        logger.warning(f"[{nombre_modelo}] predict falló: {e}")
        prediccion = 1
        
    logger.info(f"[{nombre_modelo}] Predicción: {prediccion} ({TARGET_MAPPING.get(prediccion, 'Desconocido')})")
    
    probabilidad = float(proba[prediccion]) if len(proba) > prediccion else 0.0
    duracion_ms = (time.time() - t0) * 1000
    return prediccion, probabilidad, duracion_ms


# ==========================================
# 6. ENDPOINTS
# ==========================================
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analisis-energetico")
def predict_ensamble(data: EnergyRequest):
    logger.info(f"--- NUEVA INFERENCIA RECIBIDA ---\nPayload: {data}")

    try:
        pred_xgb, prob_xgb, t_xgb = predecir_con_tiempo(model_xgb, data, "XGBoost")
        pred_logreg, prob_logreg, t_logreg = predecir_con_tiempo(model_logreg, data, "LogReg")
        pred_knn, prob_knn, t_knn = predecir_con_tiempo(model_knn, data, "KNN")
        pred_rf, prob_rf, t_rf = predecir_con_tiempo(model_rf, data, "RandomForest")
    except Exception as e:
        logger.error(f"Fallo en la inferencia del ensamble: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fallo en la inferencia: {str(e)}")

    # ==========================================
    # 7. VOTACIÓN POR MAYORÍA + DESEMPATE
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

    logger.info(f"🏆 DECISIÓN FINAL: {TARGET_MAPPING[prediccion_final]} | Método: {metodo}")

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

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)