# Configuración del Entorno de Desarrollo (SETUP)

Esta guía detalla los pasos necesarios para configurar y ejecutar el proyecto EnergiAI en un entorno local.

## Requisitos Previos
Para desplegar la arquitectura completa, asegúrate de tener instalados los siguientes componentes en tu sistema:
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Variables de Entorno

Antes de iniciar los servicios, es necesario configurar las variables de entorno. Puedes crear un archivo `.env` en la raíz de cada servicio basándote en la siguiente plantilla.

### Plantilla `.env.example` general:

```env
# ==========================================
# Frontend (/frontend/.env.development)
# ==========================================
VITE_API_URL=http://localhost:8080

# ==========================================
# Backend (/backend/Backend/src/main/resources/application.properties)
# ==========================================
# Nota: En Docker, la variable de entorno se inyecta como:
DS_API_URL=http://ml-service:8000/analisis-energetico
TELEGRAM_BOT_TOKEN=tu_token_de_telegram_aqui
TELEGRAM_BOT_USERNAME=tu_username_del_bot

# ==========================================
# ML-Service (/ml-service/.env)
# ==========================================
PORT=8000
# Credenciales para descarga de modelos desde OCI (si aplica)
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_DEFAULT_REGION=tu_region
```

## Guía de Ejecución Paso a Paso

El proyecto está dockerizado para facilitar su levantamiento conjunto.

1. **Clonar el repositorio**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd Hackaton_G9_Server_2_Team27
   ```

2. **Asegurar dependencias de modelos ML**:
   El microservicio de Python descargará automáticamente los modelos al iniciar. Si necesitas descargar los modelos manualmente previamente, puedes ejecutar el script `setup-oci.sh` o permitir que `main.py` lo haga.

3. **Construir y levantar los contenedores**:
   En la raíz del proyecto, donde se ubica el archivo `docker-compose.yml`, ejecuta:
   ```bash
   docker-compose up --build -d
   ```
   Este comando construirá las imágenes de Docker para el Frontend, Backend y ML-Service, orquestándolos en una red interna virtual (`energia_network`).

4. **Verificar el estado de los servicios**:
   Puedes revisar los logs en tiempo real para asegurar que todo arrancó correctamente:
   ```bash
   docker-compose logs -f
   ```

## Accesos a los Servicios

Una vez que los contenedores estén corriendo, puedes acceder a los servicios a través de las siguientes URLs locales:

- **Frontend (Interfaz de Usuario)**: [http://localhost:3000](http://localhost:3000)
- **Backend (API Principal)**: [http://localhost:8080](http://localhost:8080)
- **ML-Service (API Inteligencia Artificial)**: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI disponible)

## Detener el Sistema
Para detener los contenedores sin perder volúmenes (si los hubiera):
```bash
docker-compose stop
```
Para detener y eliminar los contenedores y redes creadas:
```bash
docker-compose down
```
