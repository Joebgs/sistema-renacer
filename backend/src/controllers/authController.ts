/**
 * CONTROLADOR DE AUTENTICACIÓN
 * 
 * Este archivo maneja las operaciones de autenticación:
 * - Login de usuarios (genera token JWT)
 * - Registro de usuarios (solo admin puede crear usuarios básicos)
 * - Obtener información del usuario autenticado
 * 
 * @module AuthController
 */

import { Request, Response } from 'express';
import { login, registrarUsuario } from '../services/authService';
import { registrarIntentoFallido, registrarConsultaAuditoria } from '../middleware/security';
import pool from '../db';

/**
 * INICIAR SESIÓN
 * 
 * Endpoint: POST /api/auth/login
 * 
 * Acceso: PÚBLICO
 * 
 * Flujo:
 * 1. Recibir email y password
 * 2. Validar credenciales con el servicio de autenticación
 * 3. Registrar intento exitoso en auditoría
 * 4. Devolver token JWT y datos del usuario
 * 
 * @param req - Petición HTTP (contiene email y password en body)
 * @param res - Respuesta HTTP
 */
export async function loginController(req: Request, res: Response) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const resultado = await login(email, password);
    
    // Registrar auditoría de inicio exitoso
    await registrarConsultaAuditoria(email, resultado.usuario.id, ip, req.headers['user-agent'], true);
    
    res.json(resultado);
  } catch (error: any) {
    // Registrar intento fallido (para bloqueo de IP)
    await registrarIntentoFallido(ip, 'login', error.message);
    await registrarConsultaAuditoria(email, null, ip, req.headers['user-agent'], false);
    
    res.status(401).json({ error: error.message });
  }
}

/**
 * REGISTRAR NUEVO USUARIO (básico)
 * 
 * Endpoint: POST /api/auth/registrar
 * 
 * Acceso: Solo ADMIN
 * 
 * Crea usuarios de tipo AUXILIAR o GERENTE_ZONA (sin región automática)
 * 
 * @param req - Petición HTTP (contiene email, nombre, password, rol en body)
 * @param res - Respuesta HTTP
 */
export async function registrarController(req: Request, res: Response) {
  try {
    const { email, nombre, password, rol, gerenteZonaId } = req.body;

    // Verificar si el email ya existe
    const existe = await pool.query('SELECT id FROM "Usuario" WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const usuario = await registrarUsuario({
      email,
      nombre,
      password,
      rol,
      gerenteZonaId
    });

    res.status(201).json({
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol
    });
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * OBTENER USUARIO ACTUAL
 * 
 * Endpoint: GET /api/auth/me
 * 
 * Acceso: Requiere autenticación (token JWT)
 * 
 * Devuelve los datos del usuario logueado incluyendo su zona asignada
 * 
 * @param req - Petición HTTP (contiene usuario decodificado del token)
 * @param res - Respuesta HTTP
 */
export async function meController(req: Request, res: Response) {
  try {
    const usuario = (req as any).usuario;
    const result = await pool.query(
      `SELECT u.id, u.email, u.nombre, u.rol, u."gerenteZonaId", g.nombre as "gerenteZona"
       FROM "Usuario" u
       LEFT JOIN "GerenteZona" g ON u."gerenteZonaId" = g.id
       WHERE u.id = $1`,
      [usuario.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: error.message });
  }
}