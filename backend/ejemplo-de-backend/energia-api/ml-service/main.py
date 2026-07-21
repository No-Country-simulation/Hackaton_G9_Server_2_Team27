from fastapi import FastAPI, HTTPException, Body
import joblib
import pandas as pd
import sys
from typing import Any, Dict
from sklearn.base import BaseEstimator, TransformerMixin

# 1. CLASE PERSONALIZADA (Feature Engineering)
class FullDomainFeatureEngineer(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()

        # Cálculos de ratios y densidades requeridos por el pipeline
        X['kwh_por_m2'] = X['consumo_kwh'] / X['metros_cuadrados'].replace(0, 1)
        X['kwh_por_persona'] = X['consumo_kwh'] / X['cantidad_personas'].replace(0, 1)
        X['kwh_por_equipo'] = X['consumo_kwh'] / X['cantidad_equipos'].replace(0, 1)
        X['densidad_poblacional'] = X['cantidad_personas'] / X['metros_cuadrados'].replace(0, 1)
        X['ratio_horas_pico'] = X['horas_alto_consumo'] / 24.0

        return X

# Mapeo de módulo interactivo
sys.modules['__main__'].FullDomainFeatureEngineer = FullDomainFeatureEngineer
import __main__
__main__.FullDomainFeatureEngineer = FullDomainFeatureEngineer


app = FastAPI(title="ML Energy Model Service")

# 2. Cargar artefactos .pkl
try:
    pipeline = joblib.load("energia_xgboost_pipeline.pkl")
    label_encoder = joblib.load("label_encoder.pkl")
    print("✅ Modelos .pkl cargados exitosamente.")
except Exception as e:
    print(f"❌ Error al cargar los modelos: {e}")

# Helper para transformar valores binarios ("Si"/"No", True/False) a 1 y 0
def to_binary_numeric(val, default=0):
    if isinstance(val, bool):
        return 1 if val else 0
    if isinstance(val, (int, float)):
        return int(val)
    if isinstance(val, str):
        v = val.strip().lower()
        if v in ["si", "yes", "true", "1"]:
            return 1
        if v in ["no", "false", "0"]:
            return 0
    return default


@app.post("/predict")
def predict(payload: Dict[str, Any] = Body(...)):
    try:
        # Extraer valores enviados desde Spring Boot
        consumo_kwh = payload.get("consumoKwh") or payload.get("consumo_kwh") or 300.0
        tipo_inmueble = payload.get("tipoInmueble") or payload.get("tipo_vivienda") or "Casa"
        metros_cuadrados = payload.get("metrosCuadrados") or payload.get("metros_cuadrados") or 80.0
        cantidad_personas = payload.get("cantidadPersonas") or payload.get("cantidad_personas") or 3
        cantidad_equipos = payload.get("cantidadEquipos") or payload.get("cantidad_equipos") or 5
        horas_alto_consumo = payload.get("horasAltoConsumo") or payload.get("horas_alto_consumo") or 4

        raw_pico = payload.get("usoHorarioPico") if payload.get("usoHorarioPico") is not None else payload.get("uso_horario_pico")

        # Construir el DataFrame con tipos numéricos seguros para el imputer
        input_data = {
            "tipo_vivienda": [str(tipo_inmueble)],
            "metros_cuadrados": [float(metros_cuadrados)],
            "habitaciones": [int(payload.get("habitaciones", 2))],
            "baños": [int(payload.get("baños", 1))],
            "antiguedad_vivienda": [float(payload.get("antiguedad_vivienda", 10.0))],
            "aislamiento": [str(payload.get("aislamiento", "Medio"))],
            "eficiencia_construccion": [str(payload.get("eficiencia_construccion", "B"))],
            "paneles_solares": [to_binary_numeric(payload.get("paneles_solares"), 0)],
            "cantidad_personas": [int(cantidad_personas)],
            "trabajo_remoto": [to_binary_numeric(payload.get("trabajo_remoto"), 0)],
            "horas_en_casa": [float(payload.get("horas_en_casa", 12.0))],
            "ingreso_mensual": [float(payload.get("ingreso_mensual", 1500.0))],
            "aires_acondicionados": [int(payload.get("aires_acondicionados", 1))],
            "heladeras": [int(payload.get("heladeras", 1))],
            "televisores": [int(payload.get("televisores", 1))],
            "computadoras": [int(payload.get("computadoras", 1))],
            "lavadoras": [int(payload.get("lavadoras", 1))],
            "secadoras": [int(payload.get("secadoras", 0))],
            "cantidad_equipos": [int(cantidad_equipos)],
            "calefaccion": [to_binary_numeric(payload.get("calefaccion"), 1)],
            "tipo_calefaccion": [str(payload.get("tipo_calefaccion", "Electrica"))],
            "tipo_iluminacion": [str(payload.get("tipo_iluminacion", "LED"))],
            "electrodomesticos_eficientes": [float(payload.get("electrodomesticos_eficientes", 0.5))],
            "factor_estacional": [str(payload.get("factor_estacional", "Verano"))],
            "temperatura_media": [float(payload.get("temperatura_media", 25.0))],
            "consumo_kwh": [float(consumo_kwh)],
            "uso_horario_pico": [to_binary_numeric(raw_pico, 1)],
            "horas_alto_consumo": [int(horas_alto_consumo)]
        }

        df = pd.DataFrame(input_data)

        # Inferencia
        pred_numeric = pipeline.predict(df)[0]
        probas = pipeline.predict_proba(df)[0]

        pred_label = label_encoder.inverse_transform([pred_numeric])[0]
        max_proba = float(max(probas))

        traduccion = {
            "Efficient": "Eficiente",
            "Moderate": "Moderado",
            "Inefficient": "Ineficiente"
        }
        categoria_final = traduccion.get(pred_label, pred_label)

        return {
            "categoria": categoria_final,
            "probabilidad": round(max_proba, 2)
        }

    except Exception as e:
        print(f"❌ Error en la inferencia: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error en inferencia ML: {str(e)}")
