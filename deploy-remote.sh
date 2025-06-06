#!/bin/bash

echo "🚀 Deploying Lúpulos API..."

cd /var/www/lupulos-api || {
  echo "❌ No se pudo acceder a /var/www/lupulos-api"
  exit 1
}

echo "🔄 Haciendo git pull..."
git pull

echo "📦 Instalando dependencias..."
npm install

echo "🔧 Compilando proyecto..."
npm run build

echo "♻️ Reiniciando API con PM2..."
pm2 restart lupulos-api || pm2 start npm --name "lupulos-api" -- run start

echo "✅ API desplegada correctamente."
