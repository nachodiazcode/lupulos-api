#!/bin/bash

echo "🚀 Deploying Lúpulos API..."

# Cargar variables de entorno
export $(cat .env | grep -v '^#' | xargs)

# Instalar dependencias
echo "📦 Installing dependencies..."
npm install

# Build (opcional si usás TypeScript u otra build step)
# npm run build

# Reiniciar el proceso con PM2
echo "♻️ Restarting PM2 process..."
pm2 restart lupulos-api || pm2 start src/app.js --name lupulos-api

# Mostrar estado
pm2 list

echo "✅ Deployment completo!"
