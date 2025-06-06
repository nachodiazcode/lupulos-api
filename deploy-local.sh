#!/bin/bash

echo "🚀 Desplegando Lúpulos API localmente..."

cd /Users/ignaciodiaz/Documents/proyectos/lupulos-api/lupulos-app || {
  echo "❌ No se encontró el directorio local del API"
  exit 1
}

# Cargar variables
export $(cat .env.local | grep -v '^#' | xargs)

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Ejecutar con PM2
echo "♻️ Iniciando API local con PM2..."
pm2 delete lupulos-api-local || true
pm2 start src/app.js --name "lupulos-api-local"

pm2 save

echo "✅ API local corriendo con éxito!"
