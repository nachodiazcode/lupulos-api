#!/bin/bash

echo "🚀 Desplegando Lúpulos App..."

# Ruta base del proyecto
PROJECT_DIR="/var/www/lupulos-api"
APP_DIR="$PROJECT_DIR/src"

# Entrar al directorio raíz del proyecto
cd "$PROJECT_DIR" || { echo "❌ No se pudo acceder al directorio $PROJECT_DIR"; exit 1; }

# Cargar variables de entorno si .env existe
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs) || echo "⚠️ No se pudieron exportar algunas variables"
else
  echo "❌ Archivo .env no encontrado"
  exit 1
fi

# Validar que variables críticas estén definidas
if [ -z "$JWT_SECRET" ] || [ -z "$REFRESH_SECRET" ] || [ -z "$SESSION_SECRET" ] || [ -z "$MONGO_URI" ]; then
  echo "❌ Faltan variables requeridas en el entorno (JWT_SECRET, REFRESH_SECRET, SESSION_SECRET, MONGO_URI)"
  exit 1
fi

# Entrar al directorio con el código fuente
cd "$APP_DIR" || { echo "❌ No se pudo acceder al directorio $APP_DIR"; exit 1; }

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --production

# Reiniciar app con PM2
echo "♻️ Reiniciando PM2..."
pm2 restart lupulos-api || pm2 start app.js --name lupulos-api

# Mostrar estado
pm2 list

echo "✅ ¡Despliegue completo!"
