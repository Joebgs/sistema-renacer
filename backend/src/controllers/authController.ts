import { Request, Response } from 'express';
import { login, registrarUsuario } from '../services/authService';
import { registrarIntentoFallido, registrarConsultaAuditoria } from '../middleware/security';
import pool from '../db';

export async function loginController(req: Request, res: Response) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const resultado = await login(email, password);
    
    await registrarConsultaAuditoria(email, resultado.usuario.id, ip, req.headers['user-agent'], true);
    
    res.json(resultado);
  } catch (error: any) {
    await registrarIntentoFallido(ip, 'login', error.message);
    await registrarConsultaAuditoria(email, null, ip, req.headers['user-agent'], false);
    
    res.status(401).json({ error: error.message });
  }
}

export async function registrarController(req: Request, res: Response) {
  try {
    const { email, nombre, password, rol, gerenteZonaId } = req.body;

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
    res.status(500).json({ error: error.message });
  }
}

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
    res.status(500).json({ error: error.message });
  }
}