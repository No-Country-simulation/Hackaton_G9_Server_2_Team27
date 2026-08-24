# EnergiAI - Inteligencia para el Consumo Energético

EnergiAI es una plataforma que analiza el consumo eléctrico de un inmueble, clasifica su nivel de eficiencia mediante un ensamble de modelos de Machine Learning, genera recomendaciones personalizadas de ahorro y estima el impacto financiero del consumo. El proyecto fue desarrollado por el Team 27 en el marco de la Hackatón G9 (No Country).

La solución está compuesta por tres servicios independientes que se comunican entre sí:

| Servicio | Rol | Tecnología |
| :--- | :--- | :--- |
| Frontend | Interfaz web para cargar datos de consumo y visualizar resultados | React 19 + Vite + Tailwind CSS |
| Backend | API REST, orquestación de reglas de negocio y persistencia | Java 17 + Spring Boot |
| ML Service | Predicción de eficiencia energética mediante ensamble de modelos | Python 3.9 + FastAPI + scikit-learn / XGBoost |

## Arquitectura General

```text
Frontend (React+Vite :5173) → Backend (Spring Boot :8080) → ML Service (FastAPI :8000)
                                      │
                              H2 (File) + Bot Telegram
```

El usuario carga sus datos de consumo desde el frontend. El backend valida la solicitud, la envía al servicio de Machine Learning para obtener una clasificación de eficiencia, calcula la estimación financiera y arma las recomendaciones. Opcionalmente, el resultado puede enviarse al usuario por Telegram, vinculando su sesión de navegador con un chat mediante un bot propio.

## Funcionalidades principales

- Análisis energético: recibe métricas de consumo (kWh, cantidad de equipos, metros cuadrados, personas, horas de uso pico, etc.) y devuelve una categoría de eficiencia (Eficiente, Moderado, Ineficiente) con su probabilidad asociada.
- Recomendaciones personalizadas: sugerencias de ahorro generadas según la categoría obtenida.
- Estimación financiera: cálculo del costo mensual estimado en base a la tarifa de energía.
- Historial de análisis: consulta de análisis previos por ID y listado general (persistencia en base de datos H2 en archivo).
- Calculadora de paneles solares: estima la cantidad de paneles necesarios, la generación mensual, el porcentaje de cobertura y el ahorro económico a partir del consumo y las horas de sol pico.
- Notificaciones por Telegram: vinculación del navegador con un chat de Telegram para recibir los resultados del análisis y las recomendaciones de manera asíncrona.
- Autenticación simulada: endpoints de login/registro (implementación simplificada para el contexto de la hackatón).

## Motor de Machine Learning (ensamble de 4 modelos)

El microservicio ml-service expone el endpoint POST `/analisis-energetico`, que ejecuta en paralelo cuatro modelos entrenados —XGBoost, Regresión Logística, KNN y Random Forest— sobre el mismo payload. La predicción final se define por votación por mayoría, y en caso de empate se prioriza la salida de XGBoost como modelo principal. La respuesta incluye la categoría ganadora, la probabilidad, el detalle de los votos de cada modelo y las latencias de inferencia. El servicio cuenta con un sistema robusto de manejo de excepciones y bypass de preprocesamiento para garantizar alta disponibilidad en caso de incompatibilidades aisladas de versión.

Los artefactos de los modelos (`.pkl` / `.joblib`) están empaquetados localmente dentro del contenedor para garantizar latencias mínimas y eliminar dependencias de red externas durante la inferencia.

El desarrollo de los modelos —análisis exploratorio de datos (EDA), entrenamiento y evaluación— se encuentra documentado en notebooks dentro de `ciencia_datos/`.

## Estructura del repositorio

```text
Hackaton_G9_Server_2_Team27/
├── frontend/                  # Cliente React (Vite + Tailwind)
│   └── src/
│       ├── pages/             # Home, NuevoAnalisis, Historial, Comparación,
│       │                      # Simulador, CalculadoraSolar, Ranking, Login...
│       ├── components/        # SideBar, Footer, DetalleModal, etc.
│       ├── layouts/           # MainLayout
│       ├── services/          # Llamadas a la API (analisisService, telegramService)
│       └── styles/
├── backend/                   # Proyecto Spring Boot (Java 17)
│   └── src/main/java/EnegiAI/Backend/
│       ├── controller/        # AnalisisEnergeticoController, AuthController,
│       │                      # TelegramController
│       ├── service/           # AnalisisEnergeticoService, ClasificacionService,
│       │                      # RecomendacionService, EstimacionFinancieraService,
│       │                      # PanelSolarService, DataScienceClient
│       ├── dto/               # ConsumoRequest, AnalisisResponse, etc.
│       ├── model/             # Entidades y modelos de dominio
│       ├── repository/        # JPA Repositories (H2)
│       ├── telegram/          # Bot e integración con Telegram
│       └── config/            # CORS, RestTemplate
├── ml-service/                # Microservicio Python (FastAPI)
│   ├── main.py                # Endpoints /health y /analisis-energetico
│   ├── create_preprocessor.py # Generación de preprocesadores de datos
│   └── requirements.txt
├── ciencia_datos/             # Notebooks de EDA y entrenamiento de modelos
├── data/                      # Almacenamiento persistente local de H2
└── docker-compose.yml         # Orquestación local de los 3 servicios
```

## Endpoints principales del Backend

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| POST | `/analisis-energetico` | Envía datos de consumo y recibe categoría, recomendaciones y estimación |
| GET | `/analisis-energetico` | Lista el historial de análisis realizados |
| GET | `/analisis-energetico/{id}` | Consulta un análisis puntual por ID |
| POST | `/analisis-energetico/paneles-solares` | Calcula paneles solares necesarios según consumo |
| GET | `/telegram/vinculado/{sessionId}` | Verifica si un navegador está vinculado a Telegram |
| POST | `/telegram/notificar/{sessionId}` | Envía el resultado de un análisis por Telegram |
| POST | `/auth/login`, `/auth/register` | Autenticación simulada |
| GET | `/health` | Verificación de estado del servicio |
| GET | `/swagger-ui.html` | Documentación interactiva de la API (springdoc) |
| GET | `/h2-console` | Consola de la base de datos H2 (entorno de desarrollo) |

El servicio de Machine Learning expone además su propio endpoint POST `/analisis-energetico` (puerto 8000), consumido internamente por el backend a través de `DataScienceClient`.

## Cómo ejecutar el proyecto

### Opción 1 — Con Docker Compose (recomendado)

Levanta los tres servicios (ml-service, backend y frontend) en una misma red:

```bash
git clone <URL_DEL_REPOSITORIO>
cd Hackaton_G9_Server_2_Team27
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- ML Service: `http://localhost:8000`

### Opción 2 — Ejecución manual por servicio

**Backend (Java 17 + Maven):**
```bash
cd backend
./mvnw spring-boot:run
```
Corre por defecto en `http://localhost:8080`, con configuración H2 persistida en disco local y Swagger disponible en `/swagger-ui.html`.

**ML Service (Python):**
```bash
cd ml-service
pip install -r requirements.txt
python main.py
```
Corre en `http://localhost:8000`.

**Frontend (Node.js 18+):**
```bash
cd frontend
npm install
npm run dev
```
Corre en `http://localhost:5173`. Requiere que el backend esté disponible (por defecto en el puerto 8080) y que la variable `VITE_API_URL` apunte a él.

## Variables de entorno relevantes

| Variable | Servicio | Descripción |
| :--- | :--- | :--- |
| `PORT` | Backend / ML Service | Puerto de escucha del servicio |
| `DS_API_URL` | Backend | URL del microservicio de Machine Learning |
| `ML_SERVICE_URL` | Backend | URL alternativa configurada en application.properties |
| `TELEGRAM_BOT_TOKEN` | Backend | Token del bot de Telegram |
| `VITE_API_URL` | Frontend | URL base del backend consumida por el cliente |

## Despliegue

El proyecto se encuentra desplegado utilizando Railway para el Backend (Spring Boot) y el servicio de Machine Learning (FastAPI), operando en contenedores Docker independientes. El Frontend (React) está alojado en Vercel, proporcionando despliegues automáticos a partir de las ramas principales del repositorio.

## Equipo

Proyecto desarrollado por el Team 27 en la Hackatón G9 de No Country, combinando perfiles de Backend, Frontend, Ciencia de Datos/ML y DevOps.

## Estado del proyecto

EnergiAI es un MVP completamente funcional con integración robusta entre frontend, backend y el servicio de Machine Learning. Cuenta con votación por ensamble dinámico, persistencia de historial en base de datos de archivo, estimación financiera y notificaciones vía Telegram. Como próximos pasos arquitectónicos para un ambiente 100% productivo, queda implementar persistencia en una base de datos relacional externa (ej. PostgreSQL), autenticación con JWT real y la parametrización de tarifas desde una API de cotizaciones públicas.
