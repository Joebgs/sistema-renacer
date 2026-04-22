# 🚀 Sistema Renacer - Guía de Deploy

## 📋 Descripción
Sistema de gestión de vendedoras con autenticación multi-rol (Admin, Gerente, Auxiliar).

## 🏗️ Arquitectura
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + PostgreSQL + Prisma
- **Deploy**: Vercel (Frontend) + Railway (Backend)

## 🚀 Deploy Automático (GitHub Actions)

### Configuración Inicial

1. **Variables de entorno en GitHub Secrets:**
   ```bash
   # Vercel
   VERCEL_TOKEN=tu_vercel_token
   VERCEL_ORG_ID=tu_org_id
   VERCEL_PROJECT_ID=tu_project_id

   # Railway
   RAILWAY_TOKEN=tu_railway_token
   ```

2. **Configurar proyectos:**
   - Crear proyecto en [Vercel](https://vercel.com) y conectar el repo
   - Crear proyecto en [Railway](https://railway.app) y conectar el repo

3. **Deploy automático:**
   - Cada push a `main` activa el CI/CD
   - Frontend se despliega a Vercel
   - Backend se despliega a Railway

## 🔧 Deploy Manual

### Requisitos Previos
```bash
# Instalar CLIs
npm install -g vercel
curl -fsSL https://railway.app/install.sh | sh

# Login en servicios
vercel login
railway login
```

### Ejecutar Deploy
```bash
# Deploy completo
./deploy.sh full

# Solo frontend
./deploy.sh frontend

# Solo backend
./deploy.sh backend
```

## ⚙️ Configuración de Producción

### Variables de Entorno (Backend)

Crear archivo `.env` en Railway dashboard:

```env
DATABASE_URL=postgresql://usuario:password@host:5432/database
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
NODE_ENV=production
PORT=3000
```

### Variables de Entorno (Frontend)

Configurar en Vercel dashboard:

```env
VITE_API_URL=https://tu-backend-railway-url
```

## 🔍 Verificación Post-Deploy

1. **Health Check:**
   ```bash
   curl https://tu-backend-url/api/health
   ```

2. **Frontend URL:**
   - Proporcionada por Vercel después del deploy

3. **Base de datos:**
   - Verificar conexión en Railway dashboard
   - Ejecutar migraciones si es necesario

## 📊 Monitoreo

- **Vercel**: Analytics y logs en dashboard
- **Railway**: Logs y métricas en dashboard
- **Base de datos**: Monitor de Railway

## 🐛 Troubleshooting

### Problemas Comunes

1. **Build falla:**
   - Verificar dependencias en `package.json`
   - Revisar logs de GitHub Actions

2. **API no responde:**
   - Verificar variables de entorno
   - Revisar logs del backend en Railway

3. **Frontend no carga:**
   - Verificar URL del backend en variables de entorno
   - Revisar CORS settings

### Logs de Deploy
```bash
# Ver logs de GitHub Actions
# Ir a la pestaña "Actions" en GitHub

# Ver logs de Railway
railway logs

# Ver logs de Vercel
vercel logs
```

## 🔄 Actualizaciones

1. **Push a main:** Deploy automático
2. **Deploy manual:** `./deploy.sh full`
3. **Rollback:** Usar opciones de rollback en Vercel/Railway

## 📞 Soporte

Para problemas de deploy:
1. Revisar logs de error
2. Verificar configuración de variables de entorno
3. Contactar soporte de Vercel/Railway si es necesario