# Arquitectura del Proyecto

El proyecto está estructurado mediante una arquitectura de microservicios modulares, orquestados utilizando **Docker Compose**.

| Servicio | Subdirectorio | Tecnología | Puerto | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | `./frontend-app` | HTML / JavaScript / Nginx | `3000` | Interfaz web destinada al usuario final |
| **Backend API** | `./backend` | Java / Spring Boot 3 | `8080` | Gestión de la lógica de negocio y servicios de integración |
| **ML Service** | `./ml-service` | Python / FastAPI / XGBoost | `8000` | Microservicio encargado de la inferencia del modelo de Machine Learning |
| **Data Science** | `./ciencia_datos` | Jupyter Notebook (`.ipynb`) | N/A | Cuadernos destinados al análisis exploratorio de datos y entrenamiento de modelos |
| **Documentación** | `./docs` | Markdown | N/A | Documentación técnica adicional del proyecto |

---

# Despliegue Rápido

## Requisitos Previos

Para ejecutar el proyecto de forma local, es necesario contar con las siguientes herramientas instaladas:

- **Docker**
- **Docker Compose**
- **Git**

## Ejecución en Entorno Local

### 1. Clonar el repositorio y situarse en la rama correspondiente

git checkout mirror-main
## 2. Levantar los servicios mediante Docker Compose

Este comando construye las imágenes necesarias y ejecuta los diferentes servicios definidos en la configuración de Docker Compose en segundo plano.

`docker compose up -d --build`

## 3. Verificar el estado de los contenedores

Este comando permite comprobar que los contenedores correspondientes a los diferentes servicios se encuentren correctamente ejecutándose.

`docker compose ps`

## Puntos de Acceso

Una vez que todos los servicios hayan sido levantados correctamente, es posible acceder a los diferentes componentes del sistema mediante las siguientes direcciones:

| Componente | Dirección |
| :--- | :--- |
| Interfaz Web (Frontend) | `http://localhost:3000` |
| API REST (Backend) | `http://localhost:8080` |
| Documentación del Servicio de IA (Swagger UI) | `http://localhost:8000/docs` |

## Comandos Útiles de Mantenimiento

### Visualizar los Logs en Tiempo Real

Permite consultar los registros generados por los diferentes servicios mientras se encuentran en ejecución.

`docker compose logs -f`

### Detener los Servicios

Detiene y elimina los contenedores creados por Docker Compose.

`docker compose down`
