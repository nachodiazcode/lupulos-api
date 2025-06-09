#!/bin/bash

echo "🚀 Desplegando Lúpulos App..."

# Cargar variables de entorno si es necesario
export $(cat .env | grep -v '^#' | xargs)

# Entrar al directorio (ajusta si estás en otro path)
cd /var/www/lupulos-api/src

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# (Opcional) Construcción si usas TypeScript
# echo "🏗️ Compilando código..."
# npm run build

# Reiniciar con PM2
echo "♻️ Reiniciando PM2..."
pm2 restart lupulos-api || pm2 start app.js --name lupulos-api

# Estado de PM2
pm2 list

echo "✅ ¡Despliegue completo!"
