import { Request, Response, NextFunction } from 'express';
import pool from '../db';

export async function registrarConsultaAuditoria(
  cedulaConsultada: string,
  usuarioId: number | null,
  ip: string,
  userAgent: string | undefined,
  exitosa: boolean
) {
  try {
    await pool.query(
      `INSERT INTO "AuditoriaConsulta" ("cedulaConsultada", "usuarioId", ip, "userAgent", exitosa)
       VALUES ($1, $2, $3, $4, $5)`,
      [cedulaConsultada, usuarioId, ip, userAgent || null, exitosa]
    );
  } catch (error) {
    console.error('Error al registrar auditoría:', error);
  }
}

export async function registrarIntentoFallido(ip: string, tipo: string, detalle?: string) {
  try {
    await pool.query(
      `INSERT INTO "IntentoFallido" (ip, tipo, detalle) VALUES ($1, $2, $3)`,
      [ip, tipo, detalle || null]
    );
  } catch (error) {
    console.error('Error al registrar intento fallido:', error);
  }
}

export async function isIPBloqueada(ip: string): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT * FROM "IPBloqueada" 
       WHERE ip = $1 AND ("fechaExpiracion" IS NULL OR "fechaExpiracion" > NOW())`,
      [ip]
    );
    return result.rows.length > 0;
  } catch (error) {
    return false;
  }
}

export function securityMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    if (await isIPBloqueada(ip)) {
      return res.status(403).json({ 
        error: 'IP bloqueada temporalmente por actividad sospechosa. Contacte al administrador.',
        codigo: 'IP_BLOQUEADA'
      });
    }
    
    next();
  };
}