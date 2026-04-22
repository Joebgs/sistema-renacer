#!/bin/bash

# Script de Deploy Manual - Sistema Renacer
# Uso: ./deploy.sh [frontend|backend|full]

set -e

echo "🚀 Iniciando deploy del Sistema Renacer"

# Función para deploy del frontend a Vercel
deploy_frontend() {
    echo "📦 Desplegando frontend a Vercel..."
    cd frontend

    # Verificar que Vercel CLI esté instalado
    if ! command -v vercel &> /dev/null; then
        echo "Instalando Vercel CLI..."
        npm install -g vercel
    fi

    # Login a Vercel (requiere token)
    echo "Verificando login en Vercel..."
    vercel --version

    # Build y deploy
    npm run build
    vercel --prod --yes

    echo "✅ Frontend desplegado exitosamente"
    cd ..
}

# Función para deploy del backend a Railway
deploy_backend() {
    echo "🔧 Desplegando backend a Railway..."
    cd backend

    # Verificar que Railway CLI esté instalado
    if ! command -v railway &> /dev/null; then
        echo "Instalando Railway CLI..."
        curl -fsSL https://railway.app/install.sh | sh
        export PATH="$HOME/.railway/bin:$PATH"
    fi

    # Build y deploy
    npm run build
    railway deploy

    echo "✅ Backend desplegado exitosamente"
    cd ..
}

# Función para verificar health checks
verify_deployment() {
    echo "🔍 Verificando deployments..."

    # Esperar un poco para que los servicios estén listos
    sleep 10

    # Verificar frontend (Vercel proporciona URL automáticamente)
    echo "Frontend URL será mostrada por Vercel CLI"

    # Verificar backend health
    if [ -n "$RAILWAY_STATIC_URL" ]; then
        echo "Verificando health check del backend..."
        if curl -f -s "$RAILWAY_STATIC_URL/api/health" > /dev/null; then
            echo "✅ Backend health check: OK"
        else
            echo "❌ Backend health check: FAILED"
            exit 1
        fi
    fi
}

# Main deploy logic
case "$1" in
    "frontend")
        deploy_frontend
        ;;
    "backend")
        deploy_backend
        ;;
    "full"|*)
        deploy_frontend
        deploy_backend
        verify_deployment
        ;;
esac

echo "🎉 Deploy completado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configurar variables de entorno en los dashboards de Vercel/Railway"
echo "2. Actualizar la URL del backend en el frontend si cambió"
echo "3. Probar todas las funcionalidades en producción"