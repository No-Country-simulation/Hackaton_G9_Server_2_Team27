# Utilizamos la imagen oficial de Nginx basada en Alpine Linux para que sea ligera
FROM nginx:alpine

# Copiamos los archivos estáticos de nuestra SPA a la carpeta pública de Nginx
COPY index.html /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Exponemos el puerto 80 donde Nginx servirá la aplicación por defecto
EXPOSE 80
