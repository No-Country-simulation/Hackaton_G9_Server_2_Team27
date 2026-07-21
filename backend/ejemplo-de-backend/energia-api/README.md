# ⚡ Hackathon ONE (G9) Energy Efficiency API

Bienvenido al repositorio de la API de Eficiencia Energética para el MVP de la Hackathon ONE (G9) de Alura + Oracle. Esta guía te llevará paso a paso para configurar y ejecutar todo el entorno local desde cero. 🚀

---

## 📌 1. Project Overview

Este proyecto emplea una **arquitectura de microservicios dual** para ofrecer diagnósticos y recomendaciones de eficiencia energética en tiempo real:

1. **Python FastAPI (Puerto 8000)**: Un microservicio dedicado a la Inferencia de Machine Learning. Recibe los parámetros, ejecuta el modelo de IA y predice la categoría de eficiencia y su probabilidad.
2. **Java Spring Boot 3 (Puerto 8080)**: El servicio core de Backend. Centraliza la Lógica de Negocio, actúa como cliente REST para consumir el modelo en Python, calcula los costos financieros, genera recomendaciones dinámicas y almacena el historial utilizando JPA Persistence en una base de datos H2.

---

## 💻 2. System Prerequisites (Global Dependencies)

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas en tu sistema. Son obligatorias para que el proyecto compile y ejecute:

- **Java JDK 17 o superior**: Recomendamos distribuciones como [Eclipse Temurin](https://adoptium.net/) o [Amazon Corretto](https://aws.amazon.com/es/corretto/).
- **Python 3.11+**: Necesario para ejecutar el motor de Machine Learning.
- **Git**: Para el control de versiones.
- **Maven**: (Opcional, ya que el proyecto incluye su propio envoltorio ejecutable `./mvnw`).

---

## 📁 3. Repository Structure

A continuación se muestra el árbol de directorios general para ayudarte a ubicar cada servicio:

```text
energia-api/                    <-- Raíz del Proyecto (Java Spring Boot)
├── ml-service/                 <-- Microservicio Python (ML Inference)
│   ├── main.py                 <-- API de FastAPI
│   ├── energia_xgboost_...pkl  <-- Modelo entrenado
│   └── label_encoder.pkl       <-- Codificador
├── src/
│   └── main/java/.../          <-- Código Fuente de Spring Boot
├── pom.xml                     <-- Dependencias de Java (Maven)
├── mvnw / mvnw.cmd             <-- Wrapper de Maven
└── README.md                   <-- Esta documentación
```

---

## 🐍 4. Step-by-Step Setup: Python ML Service (`fastapi`)

Sigue estos pasos en tu terminal para arrancar la Inteligencia Artificial.

**Paso 1: Navegar al directorio del microservicio**
```bash
cd ml-service
```

**Paso 2: Crear y activar un entorno virtual de Python**
Es una buena práctica encapsular las dependencias. Ejecuta:
```bash
# Crear entorno virtual
python3 -m venv venv

# Activar el entorno en Linux / macOS:
source venv/bin/activate
# Activar el entorno en Windows (CMD o PowerShell):
venv\Scripts\activate
```

**Paso 3: Instalar dependencias requeridas**
Como el proyecto no cuenta con un `requirements.txt` explícito, instalaremos las bibliotecas base manualmente:
```bash
pip install fastapi uvicorn scikit-learn xgboost joblib pandas pydantic
```

**Paso 4: Iniciar el servidor FastAPI**
Levanta la API en modo desarrollo (recarga automática al guardar):
```bash
uvicorn main:app --reload --port 8000
```

**Paso 5: Verificar funcionamiento**
Abre en tu navegador la documentación generada automáticamente por FastAPI (Swagger):
🔗 **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

## ☕ 5. Step-by-Step Setup: Java Backend Service (`spring-boot`)

Abre una **nueva pestaña/ventana de terminal** (manteniendo la terminal de Python abierta) y asegúrate de estar en la raíz del proyecto `energia-api/`.

**Paso 1: Navegar al directorio raíz (si no estás ahí)**
```bash
cd ..  # Si sigues en ml-service
```

**Paso 2: Compilar el proyecto y descargar dependencias**
Utiliza el envoltorio de Maven para descargar todo lo necesario de forma automática:
```bash
./mvnw clean compile
# En Windows, usa: mvnw.cmd clean compile
```

> [!TIP]
> **Paso 3: Nota de configuración de IDE (Lombok)**
> El proyecto usa `Lombok (1.18.46)`. Asegúrate de tener instalado el **plugin de Lombok** en tu IDE (IntelliJ, Eclipse, VS Code) y de tener activada la opción de **"Annotation Processing"** para evitar advertencias de sintaxis.

**Paso 4: Iniciar la aplicación Spring Boot**
```bash
./mvnw spring-boot:run
# En Windows, usa: mvnw.cmd spring-boot:run
```

**Paso 5: Verificar funcionamiento**
Una vez arrancado, tendrás acceso a los siguientes portales de desarrollo:
- **Swagger UI (Documentación API)**: 🔗 [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Consola de Base de Datos H2**: 🔗 [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - _JDBC URL_: `jdbc:h2:mem:energiadb`
  - _User Name_: `sa`
  - _Password_: `(dejar en blanco)`

---

## 🔄 6. Execution Order & Integration Test

> [!IMPORTANT]
> **El servicio de Python (puerto 8000) SIEMPRE debe ser arrancado ANTES que la aplicación Java (puerto 8080)** para asegurar la operatividad End-to-End sin utilizar mecanismos de contingencia local.

Una vez que tengas ambos servicios corriendo, abre una tercera consola e invoca la API principal usando `curl`:

```bash
curl -X 'POST' \
  'http://localhost:8080/analisis-energetico' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "consumoKwh": 350.5,
  "usoHorarioPico": true,
  "cantidadEquipos": 5,
  "tipoInmueble": "Residencial",
  "horasAltoConsumo": 7,
  "metrosCuadrados": 120.0,
  "cantidadPersonas": 4
}'
```

Deberías recibir un JSON (HTTP 200) persistido con las recomendaciones calculadas y la predicción del modelo.

---

## 🛠️ 7. Common Issues & Troubleshooting

- **`Lombok / JDK Compilation Error`**: 
  - *Síntoma*: Error `ExceptionInInitializerError: com.sun.tools.javac.code.TypeTag :: UNKNOWN` al hacer build.
  - *Solución*: Este proyecto requiere Lombok 1.18.34 o superior para compatibilidad con compiladores de Java modernos (como Java 21+). Ya fue solucionado en este repositorio forzando la versión `1.18.46` en el `pom.xml`.

- **`422 Unprocessable Content` (FastAPI Error)**:
  - *Síntoma*: Falla el mapeo entre Java y Python.
  - *Solución*: Verifica en Java el contrato de datos. Todos los nombres de llaves y tipos de datos en la petición hacia Python deben coincidir estrictamente con el modelo Pydantic del `main.py`.

- **`Python Service Down (Fallback)`**:
  - *Síntoma*: Aparece un _Warning_ en la consola de Spring Boot (`El servicio de Machine Learning no está disponible...`).
  - *Explicación*: Spring Boot está diseñado para **no caerse**. Si el puerto 8000 no responde, atrapa la excepción y usa una lógica local simulada para retornar un análisis funcional y que la UI no reciba un error 500.

- **`Port Conflicts`**:
  - *Síntoma*: "Web server failed to start. Port 8080 was already in use."
  - *Solución*: Identifica y elimina el proceso que ocupa los puertos `8000` o `8080` (ej: `lsof -i :8080` en macOS/Linux y luego haz un `kill -9 PID`).
