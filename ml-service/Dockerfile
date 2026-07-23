# Usamos una imagen ligera de Python
FROM python:3.11-slim

# Instalar curl para que el healthcheck de Docker funcione
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiamos las dependencias primero (para optimizar la caché de Docker)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código (modelo, scripts, etc.)
COPY . .

# Exponemos el puerto de FastAPI
EXPOSE 8000

# Comando para arrancar el servidor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
