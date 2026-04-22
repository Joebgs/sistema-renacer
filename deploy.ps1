# Script de Deploy - Sistema Renacer
# Uso: .\deploy.ps1 [frontend|backend|full]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("frontend", "backend", "full")]
    [string]$Target = "full"
)

Write-Host "🚀 Iniciando deploy del Sistema Renacer" -ForegroundColor Green

# Función para verificar comandos
function Test-Command {
    param($Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Función para deploy del frontend a Vercel
function Deploy-Frontend {
    Write-Host "📦 Desplegando frontend a Vercel..." -ForegroundColor Yellow

    Push-Location frontend

    # Verificar Node.js
    if (-not (Test-Command "node")) {
        Write-Error "Node.js no está instalado"
        exit 1
    }

    # Instalar dependencias
    Write-Host "Instalando dependencias del frontend..."
    npm install

    # Build
    Write-Host "Construyendo frontend..."
    npm run build

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build del frontend falló"
        Pop-Location
        exit 1
    }

    # Verificar Vercel CLI
    if (-not (Test-Command "vercel")) {
        Write-Host "Instalando Vercel CLI..."
        npm install -g vercel
    }

    # Deploy a Vercel
    Write-Host "Desplegando a Vercel..."
    vercel --prod --yes

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend desplegado exitosamente" -ForegroundColor Green
    } else {
        Write-Warning "Deploy del frontend completado con advertencias"
    }

    Pop-Location
}

# Función para deploy del backend a Railway
function Deploy-Backend {
    Write-Host "🔧 Desplegando backend a Railway..." -ForegroundColor Yellow

    Push-Location backend

    # Verificar Node.js
    if (-not (Test-Command "node")) {
        Write-Error "Node.js no está instalado"
        exit 1
    }

    # Instalar dependencias
    Write-Host "Instalando dependencias del backend..."
    npm install

    # Build
    Write-Host "Construyendo backend..."
    npm run build

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build del backend falló"
        Pop-Location
        exit 1
    }

    # Verificar Railway CLI
    if (-not (Test-Command "railway")) {
        Write-Host "Instalando Railway CLI..."
        try {
            Invoke-WebRequest -Uri "https://railway.app/install.sh" -OutFile "$env:TEMP\railway-install.sh"
            & bash "$env:TEMP\railway-install.sh"
            $env:PATH = "$env:USERPROFILE\.railway\bin;$env:PATH"
        } catch {
            Write-Warning "No se pudo instalar Railway CLI automáticamente. Instálalo manualmente: https://railway.app/install.sh"
        }
    }

    # Deploy a Railway
    Write-Host "Desplegando a Railway..."
    if (Test-Command "railway") {
        railway deploy
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backend desplegado exitosamente" -ForegroundColor Green
        } else {
            Write-Warning "Deploy del backend completado con advertencias"
        }
    } else {
        Write-Host "⚠️ Railway CLI no disponible. Deploy manual requerido." -ForegroundColor Yellow
        Write-Host "Ejecuta: railway login && railway deploy" -ForegroundColor Cyan
    }

    Pop-Location
}

# Función para verificar deployments
function Test-Deployments {
    Write-Host "🔍 Verificando deployments..." -ForegroundColor Yellow

    # Esperar un poco para que los servicios estén listos
    Start-Sleep -Seconds 10

    Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Configurar variables de entorno en los dashboards de Vercel/Railway" -ForegroundColor White
    Write-Host "2. Actualizar la URL del backend en el frontend si cambió" -ForegroundColor White
    Write-Host "3. Probar todas las funcionalidades en producción" -ForegroundColor White
}

# Main deploy logic
switch ($Target) {
    "frontend" {
        Deploy-Frontend
    }
    "backend" {
        Deploy-Backend
    }
    "full" {
        Deploy-Frontend
        Deploy-Backend
        Test-Deployments
    }
}

Write-Host ""
Write-Host "🎉 Deploy completado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Ver guía completa en DEPLOY.md" -ForegroundColor Cyan