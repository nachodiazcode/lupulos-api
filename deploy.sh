#!/bin/bash

echo "🚀 Deploying Lúpulos API..."

# Ir al directorio del backend
cd /var/www/lupulos-api

# Cargar variables de entorno
export $(cat .env | grep -v '^#' | xargs)

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# (opcional) Compilar si usás TypeScript
# npm run build

# Reiniciar con PM2
echo "♻️ Reiniciando API con PM2..."
pm2 delete lupulos-api
pm2 start src/app.js --name lupulos-api

# Guardar configuración de PM2
pm2 save

echo "✅ API desplegada correctamente!"
