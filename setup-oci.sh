#!/bin/bash
echo "🚀 Configurando servidor OCI para EnergiAI..."

# 1. Abrir puertos en el firewall de iptables de OCI
echo "Abriendo puertos 80 y 8080 en iptables..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT
sudo netfilter-persistent save

# 2. Instalar Docker y Docker Compose
echo "Instalando Docker y Docker Compose..."
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu

echo "✅ ¡Servidor listo!"
echo "⚠️ PASO FINAL: Crea el archivo ml-service/.env con las URLs de OCI."
echo "Luego ejecuta: docker-compose up -d --build"
