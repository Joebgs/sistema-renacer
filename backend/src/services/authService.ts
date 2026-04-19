/**
 * SERVICIO DE AUTENTICACIÓN
 * 
 * Este archivo contiene la lógica de negocio para:
 * - Login de usuarios (verificación de credenciales)
 * - Registro de nuevos usuarios
 * 
 * @module AuthService
 */

import bcrypt from 'bcryptjs'
import { generarToken } from '../utils/jwt'
import pool from '../db'

/**
 * INICIAR SESIÓN
 * 
 * Verifica las credenciales del usuario y genera un token JWT
 * 
 * @param email - Correo electrónico del usuario
 * @param password - Contraseña en texto plano
 * @returns Token JWT y datos del usuario
 * @throws Error si el usuario no existe o la contraseña es incorrecta
 */
export async function login(email: string, password: string) {
  // Buscar usuario por email
  const result = await pool.query(
    `SELECT id, email, nombre, password, rol, "gerenteZonaId" 
     FROM "Usuario" 
     WHERE email = $1`,
    [email]
  )

  const usuario = result.rows[0]

  if (!usuario) {
    throw new Error('Usuario no encontrado')
  }

  // Verificar contraseña usando bcrypt
  const passwordValida = await bcrypt.compare(password, usuario.password)
  if (!passwordValida) {
    throw new Error('Contraseña incorrecta')
  }

  // Generar token JWT con los datos del usuario
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

/**
 * REGISTRAR NUEVO USUARIO
 * 
 * Crea un nuevo usuario en la base de datos
 * 
 * @param data - Datos del nuevo usuario (email, nombre, password, rol, gerenteZonaId)
 * @returns Usuario creado (sin contraseña)
 */
export async function registrarUsuario(data: {
  email: string
  nombre: string
  password: string
  rol: string
  gerenteZonaId?: number
}) {
  // Hashear la contraseña antes de guardarla
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(data.password, salt)

  // Insertar en la base de datos
  const result = await pool.query(
    `INSERT INTO "Usuario" (email, nombre, password, rol, "gerenteZonaId")
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, nombre, rol`,
    [data.email, data.nombre, passwordHash, data.rol, data.gerenteZonaId || null]
  )

  return result.rows[0]
}