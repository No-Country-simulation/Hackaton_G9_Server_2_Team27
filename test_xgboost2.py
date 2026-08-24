import joblib
import warnings
import numpy as np
import pandas as pd

try:
    model = joblib.load('ml-service/energia_pipeline_mvp.pkl')
    X = pd.DataFrame({
        'consumo_kwh': [45.0],
        'uso_horario_pico': [False],
        'cantidad_equipos': [2],
        'tipo_vivienda': ['Casa'],
        'horas_alto_consumo': [1]
    })
    print("Predict_proba...")
    pred_proba = model.predict_proba(X)
    print("Probabilities:", pred_proba)
except Exception as e:
    print("Error:", type(e), e)
