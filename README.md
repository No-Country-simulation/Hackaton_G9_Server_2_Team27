# EnergiAI - Sistema de Análisis Energético

## Descripción General
EnergiAI es una plataforma innovadora diseñada para proporcionar a los usuarios un análisis detallado de su consumo energético. Mediante el uso de modelos avanzados de Machine Learning, el sistema evalúa los patrones de consumo eléctrico, clasifica la eficiencia energética del inmueble (Eficiente, Moderado, Ineficiente) y ofrece recomendaciones como el cálculo de paneles solares necesarios para lograr independencia energética.

## Arquitectura del Sistema
El proyecto está diseñado bajo una **arquitectura de microservicios**, lo que garantiza alta disponibilidad, escalabilidad y un bajo acoplamiento entre los componentes. La orquestación local se maneja íntegramente a través de **Docker Compose**.

1. **Frontend (Capa de Presentación)**: Aplicación SPA (Single Page Application) que ofrece una interfaz interactiva y amigable para el usuario final.
2. **Backend (Capa de Negocio e Integración)**: Servicio centralizado que gestiona las peticiones del frontend, orquesta llamadas al servicio de Inteligencia Artificial y maneja la persistencia y notificaciones (ej. Integración con bots de Telegram).
3. **ML-Service (Capa de Inteligencia Artificial)**: Microservicio dedicado exclusivamente a la inferencia de Machine Learning. Expone una API rápida que carga pipelines pre-entrenados y utiliza un sistema de ensamblado (XGBoost, Random Forest, KNN, Regresión Logística) para retornar la predicción con mayor consenso.

## Stack Tecnológico

### Frontend
- **Framework**: React 19 + Vite
- **Estilos**: Tailwind CSS 4, Lucide React (iconos)
- **Gráficos y Enrutamiento**: Recharts, React Router DOM
- **Lenguaje**: JavaScript (ESModules)

### Backend
- **Framework**: Java 17, Spring Boot 3.x
- **Dependencias Principales**: Spring Web, Spring Data JPA, Spring Validation
- **Base de Datos**: H2 Database (En memoria, para desarrollo)
- **Integraciones**: TelegramBots (para notificaciones)
- **Construcción**: Maven

### ML-Service (Inteligencia Artificial)
- **Framework**: Python 3, FastAPI, Uvicorn
- **Librerías de ML**: Scikit-Learn 1.6.1, XGBoost, Pandas, Joblib
- **Cloud/Almacenamiento**: Boto3 (Para descarga de modelos desde Oracle Cloud Infrastructure - OCI)

### Infraestructura y Despliegue
- **Contenedores**: Docker, Docker Compose
