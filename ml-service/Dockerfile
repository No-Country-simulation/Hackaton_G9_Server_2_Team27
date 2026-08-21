FROM --platform=linux/amd64 python:3.9-slim
WORKDIR /app

# Instalar dependencias del sistema necesarias para XGBoost (OpenMP)
RUN apt-get update && apt-get install -y libgomp1 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
