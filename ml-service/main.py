from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import sys
import time
from typing import Any, Dict
from collections import Counter
from sklearn.base import BaseEstimator, TransformerMixin

# ==========================================
# 1. TRANSFORMADOR PERSONALIZADO (XGBoost)
# ==========================================
class FullDomainFeatureEngineer(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        X['kwh_por_m2'] = X['consumo_kwh'] / X['metros_cuadrados'].replace(0, 1)
        X['kwh_por_persona'] = X['consumo_kwh'] / X['cantidad_personas'].replace(0, 1)
        X['kwh_por_equipo'] = X['consumo_kwh'] / X['cantidad_equipos'].replace(0, 1)
        X['densidad_poblacional'] = X['cantidad_personas'] / X['metros_cuadrados'].replace(0, 1)
        X['ratio_horas_pico'] = X['horas_alto_consumo'] / 24.0
        return X

# Registrar la clase en el entorno global para que pickle/joblib pueda encontrarla
sys.modules['__main__'].FullDomainFeatureEngineer = FullDomainFeatureEngineer
import __main__
__main__.FullDomainFeatureEngineer = FullDomainFeatureEngineer

app = FastAPI(title="ML Energy Model Service - Dynamic Feature Ensemble")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 2. MÉTRICAS Y DICCIONARIOS AUDITADOS
# ==========================================
METRICAS_MODELOS = {
    "XGBoost": 0.8625,
    "Regresion Logistica": 0.8290,
    "KNN": 0.7885
}

MAPA_KNN = {0: "Eficiente", 1: "Ineficiente", 2: "Moderado"}
MAPA_LOG = {0: "Ineficiente", 1: "Moderado", 2: "Eficiente"}
MAPA_XGB = {0: "Eficiente", 1: "Ineficiente", 2: "Moderado"}

def traducir_etiqueta(label_raw):
    label_str = str(label_raw).strip().lower()
    traducciones = {
        "efficient": "Eficiente",
        "eficiente": "Eficiente",
        "moderate": "Moderado",
        "moderado": "Moderado",
        "inefficient": "Ineficiente",
        "ineficiente": "Ineficiente"
    }
    return traducciones.get(label_str, str(label_raw))

# ==========================================
# 3. CARGA DE MODELOS EN MEMORIA
# ==========================================
try:
    pipeline_xgb = joblib.load("modelos/energia_xgboost_pipeline.pkl")
    label_encoder = joblib.load("modelos/label_encoder.pkl")
    pipeline_knn = joblib.load("modelos/pipeline_produccion_knn.pkl")
    pipeline_log = joblib.load("modelos/pipeline_logistico_v1_logistic_reg.joblib")
    print("✅ Los 3 Modelos y Artefactos cargados correctamente.")
except Exception as e:
    print(f"❌ Error al cargar artefactos de ML: {e}")

# ==========================================
# 4. ENDPOINT DE INFERENCIA Y ENSAMBLE
# ==========================================
@app.post("/predict/compare")
def predict_and_compare(payload: Dict[str, Any] = Body(...)):
    try:
        print("\n==================================================")
        print("📥 PAYLOAD RECIBIDO:", payload)

        # ----------------------------------------------------
        # EXTRACCIÓN DE DATOS REALES (FRONTEND)
        # ----------------------------------------------------
        consumo_kwh = float(payload.get("consumoKwh") or payload.get("consumo_kwh") or 300.0)
        metros_cuadrados = float(payload.get("metrosCuadrados") or payload.get("metros_cuadrados") or 80.0)
        cantidad_personas = int(payload.get("cantidadPersonas") or payload.get("cantidad_personas") or 3)
        cantidad_equipos = int(payload.get("cantidadEquipos") or payload.get("cantidad_equipos") or 5)
        horas_alto_consumo = int(payload.get("horasAltoConsumo") or payload.get("horas_alto_consumo") or 4)

        raw_pico = payload.get("usoHorarioPico") if payload.get("usoHorarioPico") is not None else payload.get("uso_horario_pico")
        uso_pico_int = 1 if str(raw_pico).lower() in ["true", "1", "si", "sí"] else 0

        tarifa_kwh = float(payload.get("tarifa_kwh") or payload.get("tarifaKwh") or 0.15)
        costo_estimado = float(payload.get("costo_estimado") or payload.get("costoEstimado") or (consumo_kwh * tarifa_kwh))
        tipo_inmueble = payload.get("tipoInmueble", "Casa")

        # ----------------------------------------------------
        # IMPUTACIÓN DINÁMICA DE CONTEXTO
        # Inferimos el estado de la casa por su física/uso, no por el consumo.
        # Esto previene el "Anclaje a Moderado".
        # ----------------------------------------------------
        densidad_poblacional = cantidad_personas / max(metros_cuadrados, 1)
        intensidad_uso_diario = horas_alto_consumo / 24.0

        # Asignar eficiencia de electrodomésticos (escala 0.2 a 0.9)
        electro_eficientes = max(0.2, min(0.9, 1.0 - intensidad_uso_diario + (cantidad_equipos * 0.02)))

        # Inferir aislamiento y eficiencia constructiva por área y densidad
        if metros_cuadrados >= 150:
            aislamiento_knn, aislamiento_xgb, eficiencia_const = "Good", "High", "A"
            tipo_calef_log, tipo_calef_xgb = "Gas", "Central"
        elif metros_cuadrados <= 50 or densidad_poblacional > 0.08:
            aislamiento_knn, aislamiento_xgb, eficiencia_const = "Poor", "Low", "C"
            tipo_calef_log, tipo_calef_xgb = "Electrica", "Electric"
        else:
            aislamiento_knn, aislamiento_xgb, eficiencia_const = "Average", "Average", "B"
            tipo_calef_log, tipo_calef_xgb = "Gas", "Central"

        # ----------------------------------------------------
        # A. CONSTRUCCIÓN DE DATAFRAME PARA KNN
        # ----------------------------------------------------
        df_knn = pd.DataFrame({
            "aislamiento": [aislamiento_knn],
            "eficiencia_construccion": [eficiencia_const],
            "tipo_calefaccion": [tipo_calef_log],
            "tipo_iluminacion": ["LED"],
            "antiguedad_vivienda": [15.0 if eficiencia_const == "C" else 5.0],
            "electrodomesticos_eficientes": [electro_eficientes],
            "cantidad_personas": [cantidad_personas],
            "consumo_kwh": [consumo_kwh],
            "horas_en_casa": [12.0 + (intensidad_uso_diario * 10)],
            "trabajo_remoto": [1 if horas_alto_consumo > 6 else 0]
        })

        # ----------------------------------------------------
        # B. CONSTRUCCIÓN DE DATAFRAME PARA REGRESIÓN LOGÍSTICA
        # ----------------------------------------------------
        df_log = pd.DataFrame({
            "tipo_vivienda": [tipo_inmueble],
            "metros_cuadrados": [metros_cuadrados],
            "habitaciones": [max(1, int(metros_cuadrados / 30))],
            "baños": [max(1, int(metros_cuadrados / 50))],
            "antiguedad_vivienda": [15.0 if eficiencia_const == "C" else 5.0],
            "aislamiento": [aislamiento_knn],
            "eficiencia_construccion": [eficiencia_const],
            "paneles_solares": [0],
            "cantidad_personas": [cantidad_personas],
            "trabajo_remoto": [1 if horas_alto_consumo > 6 else 0],
            "horas_en_casa": [12.0 + (intensidad_uso_diario * 10)],
            "ingreso_mensual": [1500.0 * (metros_cuadrados / 80.0)],
            "aires_acondicionados": [max(0, int(cantidad_equipos * 0.3))],
            "heladeras": [1],
            "televisores": [max(1, int(cantidad_equipos * 0.4))],
            "computadoras": [max(1, int(cantidad_equipos * 0.3))],
            "lavadoras": [1],
            "secadoras": [1 if metros_cuadrados > 100 else 0],
            "cantidad_equipos": [cantidad_equipos],
            "calefaccion": [1],
            "tipo_calefaccion": [tipo_calef_log],
            "tipo_iluminacion": ["LED"],
            "electrodomesticos_eficientes": [electro_eficientes],
            "factor_estacional": ["Verano"],
            "temperatura_media": [25.0],
            "consumo_kwh": [consumo_kwh],
            "uso_horario_pico": [uso_pico_int],
            "horas_alto_consumo": [horas_alto_consumo],
            "tarifa_kwh": [tarifa_kwh],
            "costo_estimado": [costo_estimado]
        })

        # ----------------------------------------------------
        # C. CONSTRUCCIÓN DE DATAFRAME PARA XGBOOST
        # ----------------------------------------------------
        df_xgb = pd.DataFrame({
            "tipo_vivienda": [tipo_inmueble],
            "metros_cuadrados": [metros_cuadrados],
            "habitaciones": [max(1, int(metros_cuadrados / 30))],
            "baños": [max(1, int(metros_cuadrados / 50))],
            "antiguedad_vivienda": [15.0 if eficiencia_const == "C" else 5.0],
            "aislamiento": [aislamiento_xgb],
            "eficiencia_construccion": [eficiencia_const],
            "paneles_solares": [0],
            "cantidad_personas": [cantidad_personas],
            "trabajo_remoto": [1 if horas_alto_consumo > 6 else 0],
            "horas_en_casa": [12.0 + (intensidad_uso_diario * 10)],
            "ingreso_mensual": [1500.0 * (metros_cuadrados / 80.0)],
            "aires_acondicionados": [max(0, int(cantidad_equipos * 0.3))],
            "heladeras": [1],
            "televisores": [max(1, int(cantidad_equipos * 0.4))],
            "computadoras": [max(1, int(cantidad_equipos * 0.3))],
            "lavadoras": [1],
            "secadoras": [1 if metros_cuadrados > 100 else 0],
            "cantidad_equipos": [cantidad_equipos],
            "calefaccion": [1],
            "tipo_calefaccion": [tipo_calef_xgb],
            "tipo_iluminacion": ["LED"],
            "electrodomesticos_eficientes": [electro_eficientes],
            "factor_estacional": ["Verano"],
            "temperatura_media": [25.0],
            "consumo_kwh": [consumo_kwh],
            "uso_horario_pico": [uso_pico_int],
            "horas_alto_consumo": [horas_alto_consumo]
        })

        # ==========================================
        # 5. INFERENCIAS PURAS DE CADA MODELO
        # ==========================================
        votos = {}
        latencias = {}

        # --- A. KNN ---
        try:
            start_knn = time.perf_counter()
            raw_knn = pipeline_knn.predict(df_knn)[0]
            tiempo_knn = (time.perf_counter() - start_knn) * 1000
            pred_knn = MAPA_KNN.get(int(raw_knn) if str(raw_knn).isdigit() else raw_knn, traducir_etiqueta(raw_knn))
            votos["KNN"] = pred_knn
            latencias["knn_ms"] = round(tiempo_knn, 4)
        except Exception as e_knn:
            print(f"❌ Error en KNN: {e_knn}")

        # --- B. Regresión Logística ---
        try:
            start_log = time.perf_counter()
            raw_log = pipeline_log.predict(df_log)[0]
            tiempo_log = (time.perf_counter() - start_log) * 1000
            pred_log = MAPA_LOG.get(int(raw_log) if str(raw_log).isdigit() else raw_log, traducir_etiqueta(raw_log))
            votos["Regresion Logistica"] = pred_log
            latencias["regresion_logistica_ms"] = round(tiempo_log, 4)
        except Exception as e_log:
            print(f"❌ Error en Regresión Logística: {e_log}")

        # --- C. XGBoost ---
        try:
            start_xgb = time.perf_counter()
            raw_xgb = pipeline_xgb.predict(df_xgb)[0]
            tiempo_xgb = (time.perf_counter() - start_xgb) * 1000
            try:
                pred_label_xgb = label_encoder.inverse_transform([raw_xgb])[0]
                pred_xgb = traducir_etiqueta(pred_label_xgb)
            except Exception:
                pred_xgb = MAPA_XGB.get(int(raw_xgb) if str(raw_xgb).isdigit() else raw_xgb, traducir_etiqueta(raw_xgb))
            votos["XGBoost"] = pred_xgb
            latencias["xgboost_ms"] = round(tiempo_xgb, 4)
        except Exception as e_xgb:
            print(f"❌ Error en XGBoost: {e_xgb}")

        print(f"🔮 VOTOS DE LOS MODELOS: {votos}")

        if not votos:
            raise HTTPException(status_code=500, detail="Ningún modelo pudo inferir.")

        # ==========================================
        # 6. MOTOR DE VOTACIÓN Y ENSAMBLE
        # ==========================================
        conteo_votos = Counter(votos.values())
        mas_comunes = conteo_votos.most_common()

        if mas_comunes[0][1] > 1:
            prediccion_final = mas_comunes[0][0]
            metodo_decision = f"Consenso por Mayoría ({mas_comunes[0][1]}/{len(votos)} votos)"
            desempate_aplicado = False
        else:
            modelos_disponibles = {k: METRICAS_MODELOS[k] for k in votos.keys() if k in METRICAS_MODELOS}
            modelo_top = max(modelos_disponibles, key=modelos_disponibles.get)
            prediccion_final = votos[modelo_top]
            metodo_decision = f"Desempate por Precisión Auditada ({modelo_top})"
            desempate_aplicado = True

        print(f"🏆 RESULTADO FINAL ENSAMBLE: {prediccion_final} ({metodo_decision})\n==================================================\n")

        return {
            "status": "success",
            "prediccion_final_ensamble": prediccion_final,
            "metodo_decision": metodo_decision,
            "desempate_aplicado": desempate_aplicado,
            "votos_detallados": votos,
            "precision_historica": {
                "xgboost": f"{METRICAS_MODELOS['XGBoost'] * 100:.2f}%",
                "regresion_logistica": f"{METRICAS_MODELOS['Regresion Logistica'] * 100:.2f}%",
                "knn": f"{METRICAS_MODELOS['KNN'] * 100:.2f}%"
            },
            "latencia_ms": latencias
        }

    except Exception as e:
        print(f"❌ Error general: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error en inferencia ML: {str(e)}")
