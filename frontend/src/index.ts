import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import vendedoraRoutes from './routes/vendedoraRoutes'
import zonaRoutes from './routes/zonaRoutes'
import mensajeRoutes from './routes/mensajeRoutes'
import seguridadRoutes from './routes/seguridadRoutes'

dotenv.config()

const app = express()
const PORT: number = parseInt(process.env.PORT || '3000', 10)

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/vendedora', vendedoraRoutes)
app.use('/api/zonas', zonaRoutes)
app.use('/api/mensajes', mensajeRoutes)
app.use('/api/seguridad', seguridadRoutes)

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando' })
})

// Ruta de prueba para diagnosticar
app.get('/api/test', (req, res) => {
  res.json({ message: 'Ruta de prueba funcionando' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  console.log(`📋 Health: http://localhost:${PORT}/api/health`)
  console.log(`📋 Vendedora: http://localhost:${PORT}/api/vendedora/buscar/12345678`)
})