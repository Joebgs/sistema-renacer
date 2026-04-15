import bcrypt from 'bcryptjs'
import { generarToken } from '../utils/jwt'
import pool from '../db'

export async function login(email: string, password: string) {
  const result = await pool.query(
    `SELECT id, email, nombre, password, rol, "gerenteZonaId" FROM "Usuario" WHERE email = $1`,
    [email]
  )

  const usuario = result.rows[0]

  if (!usuario) {
    throw new Error('Usuario no encontrado')
  }

  const passwordValida = await bcrypt.compare(password, usuario.password)
  if (!passwordValida) {
    throw new Error('Contraseña incorrecta')
  }

  const token = generarToken({
    id: usuario.id,
    email: usuario.email,
    rol: usuario.rol
  })

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      gerenteZonaId: usuario.gerenteZonaId
    }
  }
}

export async function registrarUsuario(data: {
  email: string
  nombre: string
  password: string
  rol: string
  gerenteZonaId?: number
}) {
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(data.password, salt)

  const result = await pool.query(
    `INSERT INTO "Usuario" (email, nombre, password, rol, "gerenteZonaId")
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, nombre, rol`,
    [data.email, data.nombre, passwordHash, data.rol, data.gerenteZonaId || null]
  )

  return result.rows[0]
}