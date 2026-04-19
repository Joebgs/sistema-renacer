/**
 * MIDDLEWARE DE AUTENTICACIÓN
 * 
 * Este archivo contiene los middlewares para:
 * - Verificar el token JWT en las peticiones protegidas
 * - Validar que el usuario tenga el rol adecuado
 * 
 * @module AuthMiddleware
 */

import { Request, Response, NextFunction } from 'express'
import { verificarToken } from '../utils/jwt'

/**
 * AUTENTICAR USUARIO
 * 
 * Verifica que la petición incluya un token JWT válido
 * 
 * @param req - Petición HTTP
 * @param res - Respuesta HTTP
 * @param next - Función para continuar al siguiente middleware
 * @returns 401 si no hay token o es inválido
 */
export function autenticar(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  // Verificar que el header Authorization existe y tiene formato Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  const token = authHeader.split(' ')[1]

  try {
    // Decodificar y verificar el token
    const decoded = verificarToken(token)
    // Adjuntar el usuario decodificado a la petición (incluyendo gerenteZonaId)
    ;(req as any).usuario = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol,
      gerenteZonaId: decoded.gerenteZonaId
    }
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

/**
 * PERMITIR SOLO CIERTOS ROLES
 * 
 * Verifica que el usuario autenticado tenga uno de los roles permitidos
 * 
 * @param rolesPermitidos - Lista de roles que pueden acceder (ej: ['ADMIN', 'AUXILIAR'])
 * @returns Middleware que valida el rol
 */
export function permitirRoles(...rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = (req as any).usuario

    if (!usuario) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    if (!rolesPermitidos.includes(usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' })
    }

    next()
  }
}