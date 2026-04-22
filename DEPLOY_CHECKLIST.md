# 🚀 Checklist de Deploy - Sistema Renacer

## ✅ Pre-Deploy Checklist

### 1. Repositorio GitHub
- [ ] Repositorio creado en GitHub
- [ ] Código subido a rama `main`
- [ ] Archivos de configuración creados (.github/workflows/deploy.yml)

### 2. Vercel (Frontend)
- [ ] Cuenta creada en [vercel.com](https://vercel.com)
- [ ] Proyecto conectado al repositorio GitHub
- [ ] Variables de entorno configuradas:
  ```
  VITE_API_URL=https://tu-backend-railway-url.up.railway.app
  ```
- [ ] Build settings verificados (framework: Vite)

### 3. Railway (Backend)
- [ ] Cuenta creada en [railway.app](https://railway.app)
- [ ] Proyecto creado y conectado al repositorio
- [ ] Base de datos PostgreSQL provisionada
- [ ] Variables de entorno configuradas:
  ```
  DATABASE_URL=postgresql://...
  JWT_SECRET=tu_jwt_secret_muy_seguro
  NODE_ENV=production
  PORT=3000
  ```

### 4. GitHub Secrets (CI/CD)
Ir a: Settings → Secrets and variables → Actions

Agregar los siguientes secrets:
```
VERCEL_TOKEN=tu_vercel_token
VERCEL_ORG_ID=tu_vercel_org_id
VERCEL_PROJECT_ID=tu_vercel_project_id
RAILWAY_TOKEN=tu_railway_token
```

## 🚀 Deploy Inicial

### Opción 1: Deploy Automático (Recomendado)
```bash
# Push a main activa el CI/CD automáticamente
git add .
git commit -m "feat: Deploy inicial a producción"
git push origin main
```

### Opción 2: Deploy Manual
```powershell
# Ejecutar script de deploy
.\deploy.ps1 full
```

## 🔍 Verificación Post-Deploy

### URLs de Producción
- **Frontend**: https://tu-proyecto.vercel.app
- **Backend**: https://tu-proyecto-railway.up.railway.app

### Health Checks
```bash
# Verificar backend
curl https://tu-backend-url.up.railway.app/api/health

# Verificar frontend (acceder vía navegador)
start https://tu-frontend-url.vercel.app
```

### Funcionalidades a Probar
- [ ] Login con diferentes roles
- [ ] Dashboard carga correctamente
- [ ] CRUD de vendedoras funciona
- [ ] Sistema de mensajes operativo
- [ ] Navegación entre secciones

## 🐛 Troubleshooting

### Problemas Comunes

#### Build falla en CI/CD
```
Solución: Verificar package.json y dependencias
```

#### API no responde
```
Solución: Verificar variables de entorno en Railway
```

#### CORS errors
```
Solución: Verificar configuración de CORS en backend
```

#### Base de datos no conecta
```
Solución: Verificar DATABASE_URL en Railway
```

### Logs de Debug
```bash
# Vercel logs
vercel logs

# Railway logs
railway logs

# GitHub Actions logs
# Ir a Actions tab en GitHub
```

## 📊 Monitoreo Continuo

- **Vercel Analytics**: Métricas de performance
- **Railway Dashboard**: Logs y métricas del backend
- **Base de datos**: Monitor de Railway
- **GitHub Actions**: Estado de builds

## 🔄 Mantenimiento

### Actualizaciones
1. Push a `main` → Deploy automático
2. Verificar health checks
3. Probar funcionalidades críticas

### Rollback
- Usar opciones de rollback en Vercel/Railway
- O crear tag específico y redeploy

---

## 📞 Contacto de Soporte

- **Vercel**: [Support](https://vercel.com/support)
- **Railway**: [Docs](https://docs.railway.app/)
- **GitHub**: [Issues](https://github.com/Joebgs/sistema-renacer/issues)

---

✅ **¡Listo para producción!**