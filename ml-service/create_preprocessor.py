import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
import os

# =====================================================================
# SCRIPT PARA RECREAR EL PREPROCESADOR (SCALER + ENCODER)
# Este script reconstruye la lógica de EDA_consumo_energetico_17_07_26.ipynb
# =====================================================================

def build_and_export_preprocessor():
    # 1. Definimos las columnas numéricas que necesitan escalado (MinMaxScaler) y las categóricas
    # Basado en el esquema de FastAPI y los notebooks
    numeric_features = [
        'consumo_kwh', 
        'cantidad_equipos', 
        'horas_alto_consumo', 
        'metros_cuadrados', 
        'cantidad_personas'
    ]
    
    categorical_features = ['tipo_inmueble']

    # 2. Pipeline Numérico: Imputar nulos con la mediana (como en el notebook) y luego Escalar
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', MinMaxScaler())
    ])

    # 3. Pipeline Categórico: Imputar nulos con constante y One-Hot Encoding
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='Comercial')),
        # handle_unknown='ignore' previene crasheos si llega una categoría nueva en inferencia
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    # 4. Ensamblamos todo en un ColumnTransformer
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ],
        remainder='passthrough' # Mantiene columnas no especificadas (como uso_horario_pico booleano)
    )

    print("🔧 Entrenando preprocesador con datos simulados (reemplazar con datos reales si es necesario)...")
    
    # IMPORTANTE: Como no tenemos el dataset real, generaremos un dataset dummy
    # con los valores máximos y mínimos lógicos para ajustar el MinMaxScaler.
    # Instrucción: Si se sube el `data.csv`, reemplazar esto con `df = pd.read_csv(...)`
    
    dummy_data = pd.DataFrame({
        'consumo_kwh': [0, 10000],          # Min y Max razonables
        'cantidad_equipos': [1, 50],
        'horas_alto_consumo': [0, 24],
        'metros_cuadrados': [20, 5000],
        'cantidad_personas': [1, 500],
        'tipo_inmueble': ['Comercial', 'Casa'],
        'uso_horario_pico': [False, True]
    })
    
    # Entrenar el preprocesador
    preprocessor.fit(dummy_data)
    
    # 5. Exportar el preprocesador
    os.makedirs("modelos", exist_ok=True)
    ruta_exportacion = "modelos/preprocessor.pkl"
    joblib.dump(preprocessor, ruta_exportacion)
    print(f"✅ Preprocesador exportado exitosamente en: {ruta_exportacion}")
    
    # Para visualizar cómo quedan las columnas (importante para main.py)
    # Extraemos nombres generados por OneHotEncoder
    cat_encoder = preprocessor.named_transformers_['cat'].named_steps['onehot']
    cat_columns = cat_encoder.get_feature_names_out(categorical_features).tolist()
    
    # uso_horario_pico pasa por 'passthrough' y va al final
    final_columns = numeric_features + cat_columns + ['uso_horario_pico']
    print("\n📊 Columnas resultantes que verán los modelos (en este orden exacto):")
    for col in final_columns:
        print(f" - {col}")

if __name__ == "__main__":
    build_and_export_preprocessor()
