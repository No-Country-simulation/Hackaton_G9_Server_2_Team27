
Este directorio contiene el pipeline completo de Entrenamiento, Preprocesamiento, Selección de Características y Exportación de un modelo de **K-Nearest Neighbors (KNN)** para la clasificación de categorías de consumo/eficiencia energética en viviendas.

El código ha sido refactorizado para producción, garantizando la eliminación de trasformaciones manuales en Pandas y empaquetando todo el flujo en un **`Pipeline` único de Scikit-Learn** listo para despliegue en entornos de producción (API con **FastAPI**).

---

## 📌 Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Arquitectura del Pipeline](#arquitectura-del-pipeline)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Requisitos](#instalación-y-requisitos)
- [Flujo de Trabajo del Código](#flujo-de-trabajo-del-código)
- [Resultados y Métricas](#resultados-y-métricas)
- [Integración y Despliegue en FastAPI](#integración-y-despliegue-en-fastapi)

---

## 🛠️ Descripción General

El objetivo del modelo es predecir la **categoría energética** (`categoria`) de una vivienda a partir de características físicas, hábitos de consumo y tipos de instalaciones.

### Principales Mejoras Implementadas:
1. **Prevención de Data Leakage:** Eliminación de variables de alta colinealidad o filtrado como `energy_efficiency_score`, `costo_estimado` y `tarifa_kwh`.
2. **Transformaciones Dentro del Pipeline:** Sustitución de `.map()` y `pd.get_dummies()` de Pandas por transformadores nativos de Scikit-Learn (`OrdinalEncoder`, `OneHotEncoder`, `RobustScaler`).
3. **Cero Mismatch de Dimensiones:** El pipeline recibe directamente los datos crudos en formato tabular o JSON y ejecuta internamente el preprocesamiento antes de predecir.

---

## 📐 Arquitectura del Pipeline

```
              ┌────────────────────────────────────────────────────────┐
              │                   Datos Crudos (DataFrame)              │
              └───────────────────────────┬────────────────────────────┘
                                          │
                                          ▼
              ┌────────────────────────────────────────────────────────┐
              │                   ColumnTransformer                    │
              ├───────────────────┬────────────────┬───────────────────┤
              │   Numeric Features│Ordinal Features│  Nominal Features │
              │   (RobustScaler)  │(OrdinalEncoder)│  (OneHotEncoder)  │
              └─────────┬─────────┴───────┬────────┴─────────┬─────────┘
                        │                 │                  │
                        └─────────────────┼──────────────────┘
                                          │
                                          ▼
              ┌────────────────────────────────────────────────────────┐
              │               KNeighborsClassifier                     │
              └───────────────────────────┬────────────────────────────┘
                                          │
                                          ▼
                               Predicción (`categoria`)
```

---

## 📁 Estructura del Proyecto

```text
.
├── archivos_pkl/
│   └── knn_pipeline.pkl    # Pipeline completo (preprocesador + modelo)
│   └── label_encoder.pkl   # Encoder para reconvertir la clase objetivo 
├── data/
│   └── dataset_limpio_modeloknn_reafactorizado.csv  # Dataset limpio tras la fase ETL
├── notebook/
│   └── knn_refactorizado_FastAPI.ipynb #Script de entrenamiento    
├── visualizaciones/
    ├── 01_balance_clases.png          # Gráfico de distribución de la variable target
    ├── 02_mutual_information.png      # Ranking de importancia de características (MI)
    └── 03_matriz_confusion.png        # Matriz de confusión en Test Set
```

---

## ⚙️ Instalación y Requisitos

Asegúrate de contar con Python 3.9+ e instalar las siguientes dependencias:

```bash
pip install pandas numpy scikit-learn matplotlib seaborn joblib
```

Para producción con FastAPI:

```bash
pip install fastapi uvicorn pydantic
```

---

## 🔄 Flujo de Trabajo del Código

El script de entrenamiento realiza de forma automatizada las siguientes fases:

1. **ETL e Imputación:** Descarga del dataset crudo de GitHub, filtrado de fuga de datos e imputación de nulos con la mediana para variables numéricas.
2. **Análisis de Información Mutua (MI):** Selección estratégica de las variables con mayor poder predictivo.
3. **Configuración de Pipeline (`ColumnTransformer`):**
   * **Variables Ordinales:** `aislamiento` (Poor, Average, Good, Excellent) y `eficiencia_construccion` (E, D, C, B, A) con `OrdinalEncoder`.
   * **Variables Nominales:** `tipo_calefaccion` y `tipo_iluminacion` con `OneHotEncoder(handle_unknown='ignore')`.
   * **Variables Numéricas:** Escalado con `RobustScaler` para mitigar valores atípicos.
4. **Optimización con `GridSearchCV`:** Ajuste fino de hiperparámetros (`n_neighbors`, `weights`, `metric`) evaluados con *Stratified K-Fold CV*.
5. **Evaluación y Exportación:** Cálculo de métricas (*Accuracy*, *F1-Score*) y generación de artefactos `.pkl`.

---

## 📊 Resultados y Métricas

El rendimiento del modelo final ajustado se evalúa mediante:
* **F1-Macro Score:** Métrica de optimización principal para evitar sesgos por desbalanceo de clases.
* **Matriz de Confusión:** Almacenada en `ciencia_datos/models/knn_model/knn_refactorizado_produccion/visualizaciones/03_matriz_confusion.png`.

---

## 🔌 Integración y Despliegue en FastAPI

Gracias al diseño encapsulado del artefacto `knn_pipeline.pkl`, la integración en FastAPI requiere muy pocas líneas de código y elimina errores de esquema:

```python
from fastapi import FastAPI
import joblib
import pandas as pd
from pydantic import BaseModel

app = FastAPI(title="API de Clasificación de Eficiencia Energética")

# Cargar artefactos de modelo
pipeline = joblib.load("models/knn_pipeline.pkl")
label_encoder = joblib.load("models/label_encoder.pkl")

class ViviendaInput(BaseModel):
    antiguedad_vivienda: float
    electrodomesticos_eficientes: float
    cantidad_personas: int
    consumo_kwh: float
    horas_en_casa: float
    trabajo_remoto: int
    aislamiento: str              # Ej: "Good"
    eficiencia_construccion: str  # Ej: "A"
    tipo_calefaccion: str         # Ej: "Gas"
    tipo_iluminacion: str          # Ej: "LED"

@app.post("/predict")
def predict_categoria(data: ViviendaInput):
    # Convertir payload a DataFrame con nombres de columnas esperados
    df_input = pd.DataFrame([data.dict()])
    
    # Inferencia automatizada a través del Pipeline
    pred_idx = pipeline.predict(df_input)
    pred_label = label_encoder.inverse_transform(pred_idx)[0]
    
    return {
        "categoria_predicha": pred_label
    }
```

---
*Desarrollado por Ingrid Catalina Parada Ortega para el proyecto Hackathon G9 LATAM - Equipo 27 (Server 2).*
