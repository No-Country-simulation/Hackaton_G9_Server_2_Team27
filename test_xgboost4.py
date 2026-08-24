import joblib
import traceback

model = joblib.load('ml-service/energia_pipeline_mvp.pkl')
import pandas as pd
X = pd.DataFrame({
    'consumo_kwh': [45.0],
    'uso_horario_pico': [False],
    'cantidad_equipos': [2],
    'tipo_vivienda': ['Casa'],
    'horas_alto_consumo': [1]
})
try:
    model.predict_proba(X)
except Exception as e:
    traceback.print_exc()
