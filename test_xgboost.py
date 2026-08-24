import joblib
import warnings
import numpy as np
import pandas as pd

try:
    model = joblib.load('ml-service/energia_pipeline_mvp.pkl')
    print("Model loaded successfully:", type(model))
    # Dummy data
    X = pd.DataFrame({
        'consumo_kwh': [45.0],
        'uso_horario_pico': [False],
        'cantidad_equipos': [2],
        'tipo_vivienda': ['Casa'],
        'horas_alto_consumo': [1]
    })
    print("Predicting...")
    pred = model.predict(X)
    print("Prediction:", pred)
except Exception as e:
    print("Error:", e)
    import traceback
    traceback.print_exc()
