/**
 * UTILIDADES JWT
 * 
 * Funciones para generar y verificar tokens JWT (JSON Web Tokens)
 * 
 * @module JWTUtils
 */

import jwt from 'jsonwebtoken'

// Clave secreta para firmar los tokens (debe estar en variables de entorno en producción)
const SECRET = process.env.JWT_SECRET || 'mi-secreto-super-seguro-cambiar-en-produccion'

/**
 * GENERAR TOKEN JWT
 * 
 * Crea un token firmado con los datos del usuario
 * 
 * @param usuario - Datos del usuario (id, email, rol)
 * @returns Token JWT válido por 24 horas
 */
export function generarToken(usuario: { id: number; email: string; rol: string }) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    SECRET,
    { expiresIn: '24h' }
  )
}

/**
 * VERIFICAR TOKEN JWT
 * 
 * Decodifica y valida un token JWT
 * 
 * @param token - Token JWT a verificar
 * @returns Datos del usuario decodificados
 * @throws Error si el token es inválido o ha expirado
 */
export function verificarToken(token: string) {
  return jwt.verify(token, SECRET) as { id: number; email: string; rol: string }
}