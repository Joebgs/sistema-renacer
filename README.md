# 🚀 Sistema Renacer

Sistema de gestión integral de vendedoras con autenticación multi-rol y arquitectura moderna.

## 📋 Características

- ✅ **Autenticación Multi-Rol**: Admin, Gerente, Auxiliar
- ✅ **Gestión de Vendedoras**: CRUD completo con búsqueda y filtros
- ✅ **Sistema de Mensajes**: Comunicación interna
- ✅ **Gestión de Usuarios**: Control de acceso y seguridad
- ✅ **Gestión de Zonas**: Organización territorial
- ✅ **Dashboard Personalizado**: Según rol del usuario
- ✅ **Arquitectura Moderna**: React 18 + Express.js + PostgreSQL

## 🏗️ Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Vite** para build y desarrollo
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **Axios** para API calls

### Backend
- **Express.js** con TypeScript
- **PostgreSQL** con Prisma ORM
- **JWT** para autenticación
- **bcryptjs** para hash de contraseñas
- **CORS** configurado

### DevOps
- **GitHub Actions** para CI/CD
- **Vercel** para frontend
- **Railway** para backend
- **ESLint** y **Prettier** para código limpio

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- PostgreSQL
- Git

### Instalación

1. **Clonar repositorio:**
   ```bash
   git clone https://github.com/Joebgs/sistema-renacer.git
   cd sistema-renacer
   ```

2. **Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configurar variables
   npm run build
   npm start
   ```

3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Acceder:**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3000`

## 🚀 Deploy a Producción

### Deploy Automático (Recomendado)
1. Configurar secrets en GitHub
2. Push a rama `main`
3. GitHub Actions hace deploy automático

### Deploy Manual
```bash
./deploy.sh full
```

📖 **Ver guía completa:** [DEPLOY.md](./DEPLOY.md)

## 📁 Estructura del Proyecto

```
sistema-renacer/
├── backend/                 # API Express.js
│   ├── src/
│   │   ├── controllers/     # Controladores de API
│   │   ├── middleware/      # Middlewares de auth y seguridad
│   │   ├── routes/          # Definición de rutas
│   │   ├── services/        # Lógica de negocio
│   │   └── utils/           # Utilidades (JWT, etc.)
│   ├── prisma/              # Schema de base de datos
│   └── dist/                # Build compilado
├── frontend/                # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas por rol
│   │   ├── services/        # Servicios de API
│   │   └── routes/          # Configuración de rutas
│   └── dist/                # Build compilado
├── .github/workflows/       # CI/CD con GitHub Actions
└── deploy.sh               # Script de deploy manual
```

## 🔐 Roles y Permisos

### Admin
- Acceso completo a todas las funcionalidades
- Gestión de usuarios y roles
- Configuración del sistema

### Gerente
- Gestión de sus vendedoras asignadas
- Visualización de mensajes
- Dashboard personalizado

### Auxiliar
- Acceso a todas las vendedoras
- Gestión de mensajes
- Dashboard general

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/logout` - Logout

### Vendedoras
- `GET /api/vendedora` - Listar vendedoras (filtrado por rol)
- `POST /api/vendedora` - Crear vendedora
- `PUT /api/vendedora/:id` - Actualizar vendedora
- `DELETE /api/vendedora/:id` - Eliminar vendedora

### Mensajes
- `GET /api/mensaje` - Listar mensajes
- `POST /api/mensaje` - Enviar mensaje

### Usuarios
- `GET /api/usuario` - Listar usuarios (solo admin)
- `POST /api/usuario` - Crear usuario (solo admin)

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run test
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

- **Autor:** Joel
- **GitHub:** [Joebgs](https://github.com/Joebgs)
- **Proyecto:** [Sistema Renacer](https://github.com/Joebgs/sistema-renacer)

---

⭐ **Si te gusta el proyecto, dale una estrella en GitHub!**