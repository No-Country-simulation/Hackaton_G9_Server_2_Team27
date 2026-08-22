# Documentación de la API (Contratos de Microservicios)

Este documento describe los contratos de comunicación (Endpoints, métodos HTTP, y estructuras de datos) expuestos por el Backend (Spring Boot) y el servicio de Machine Learning (FastAPI).

---

## 1. BACKEND (Spring Boot)
**Base URL Local:** `http://localhost:8080`

### 1.1. Análisis Energético

#### Generar Análisis Energético
- **Endpoint:** `/analisis-energetico`
- **Método:** `POST`
- **Descripción:** Recibe los datos del usuario, orquesta la validación, envía la petición al ML-Service y guarda/retorna el resultado de eficiencia.

**Request Body Esperado:**
```json
{
  "consumo_kwh": 350.5,
  "uso_horario_pico": true,
  "cantidad_equipos": 5,
  "tipo_inmueble": "Residencial",
  "horas_alto_consumo": 4,
  "metros_cuadrados": 120.0,
  "cantidad_personas": 4
}
```

**Response (200 OK):**
```json
{
  "categoria": "Eficiente",
  "probabilidad": 0.95,
  "detalles": {
    "metodo_decision": "Consenso por mayoría (3/4 votos)"
  }
}
```

#### Consultar Análisis por ID
- **Endpoint:** `/analisis-energetico/{id}`
- **Método:** `GET`
- **Descripción:** Obtiene los detalles de un análisis guardado previamente.

#### Listar Historial de Análisis
- **Endpoint:** `/analisis-energetico`
- **Método:** `GET`
- **Descripción:** Retorna una lista con todos los análisis registrados.

#### Calcular Paneles Solares
- **Endpoint:** `/analisis-energetico/paneles-solares`
- **Método:** `POST`
- **Descripción:** Estima la cantidad de paneles solares requeridos según un consumo dado.

**Request Body Esperado:**
```json
{
  "consumo_mensual_kwh": 500,
  "horas_sol_diarias": 5.5
}
```

---

### 1.2. Autenticación (Auth)

#### Login
- **Endpoint:** `/auth/login`
- **Método:** `POST`

**Request Body:**
```json
{
  "email": "usuario@test.com",
  "password": "mypassword"
}
```

**Response (200 OK):**
```json
{
  "token": "simulated_jwt_token_from_backend"
}
```

#### Registro
- **Endpoint:** `/auth/register`
- **Método:** `POST`

---

### 1.3. Integración con Telegram

#### Consultar Vinculación
- **Endpoint:** `/telegram/vinculado/{sessionId}`
- **Método:** `GET`
- **Descripción:** Consulta mediante polling si el usuario ya enlazó su navegador al bot de Telegram.

**Response (200 OK):**
```json
{
  "vinculado": true
}
```

#### Enviar Notificación
- **Endpoint:** `/telegram/notificar/{sessionId}`
- **Método:** `POST`
- **Descripción:** Envía el resultado del análisis energético al chat de Telegram vinculado.

---

## 2. ML-SERVICE (FastAPI)
Este servicio es consumido de forma interna por el Backend, pero está expuesto en la red de Docker.
**Base URL Local (o Interna):** `http://ml-service:8000`

#### Inferencia de Ensamble de Modelos
- **Endpoint:** `/analisis-energetico`
- **Método:** `POST`
- **Descripción:** Recibe las variables estandarizadas, procesa a través de 4 pipelines de Machine Learning (XGBoost, Logistic Regression, KNN, Random Forest) y resuelve la predicción final por sistema de votación mayoritaria.

**Request Body Esperado:**
```json
{
  "consumo_kwh": 350.5,
  "uso_horario_pico": true,
  "cantidad_equipos": 5,
  "tipo_inmueble": "Residencial",
  "horas_alto_consumo": 4,
  "metros_cuadrados": 120.0,
  "cantidad_personas": 4
}
```

**Response (200 OK):**
```json
{
  "categoria": "Eficiente",
  "probabilidad": 0.8934,
  "detalles": {
    "votos_detallados": {
      "XGBoost": "Eficiente",
      "Regresion Logistica": "Moderado",
      "KNN": "Eficiente",
      "Random Forest": "Eficiente"
    },
    "metodo_decision": "Consenso por mayoría (3/4 votos)",
    "latencias_ms": {
      "xgboost_ms": 12.5,
      "regresion_logistica_ms": 3.2,
      "knn_ms": 15.1,
      "random_forest_ms": 22.4
    }
  }
}
```

#### Health Check
- **Endpoint:** `/health`
- **Método:** `GET`
- **Descripción:** Verifica la disponibilidad del motor de IA.
