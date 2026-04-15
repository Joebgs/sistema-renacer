import { Request, Response, NextFunction } from 'express';
import pool from '../db';

const CONFIG = {
  MAX_INTENTOS_LOGIN: 5,
  BLOQUEO_TEMPORAL_MINUTOS: 30,
  VENTANA_MINUTOS: 5
};

export async function registrarIntentoFallido(ip: string, tipo: string, detalle?: string) {
  try {
    await pool.query(
      `INSERT INTO "IntentoFallido" (ip, tipo, detalle) VALUES ($1, $2, $3)`,
      [ip, tipo, detalle || null]
    );

    // Contar intentos recientes
    const result = await pool.query(
      `SELECT COUNT(*) FROM "IntentoFallido" 
       WHERE ip = $1 AND fecha > NOW() - INTERVAL '${CONFIG.VENTANA_MINUTOS} minutes'`,
      [ip]
    );
    
    const intentos = parseInt(result.rows[0].count);
    
    if (intentos >= CONFIG.MAX_INTENTOS_LOGIN) {
      await bloquearIP(ip, `${intentos} intentos fallidos en ${CONFIG.VENTANA_MINUTOS} minutos`);
    }
    
    return intentos;
  } catch (error) {
    console.error('Error al registrar intento fallido:', error);
  }
}

export async function bloquearIP(ip: string, motivo: string) {
  try {
    await pool.query(
      `INSERT INTO "IPBloqueada" (ip, motivo, "fechaExpiracion", "intentosRegistrados")
       VALUES ($1, $2, NOW() + INTERVAL '${CONFIG.BLOQUEO_TEMPORAL_MINUTOS} minutes', 1)
       ON CONFLICT (ip) DO UPDATE SET
         motivo = EXCLUDED.motivo,
         "fechaExpiracion" = NOW() + INTERVAL '${CONFIG.BLOQUEO_TEMPORAL_MINUTOS} minutes',
         "intentosRegistrados" = "IPBloqueada"."intentosRegistrados" + 1`,
      [ip, motivo]
    );
    console.log(`🚫 IP bloqueada: ${ip} - Motivo: ${motivo}`);
  } catch (error) {
    console.error('Error al bloquear IP:', error);
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

export function securityMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    // Verificar si IP está bloqueada
    if (await isIPBloqueada(ip)) {
      return res.status(403).json({ 
        error: 'IP bloqueada temporalmente por actividad sospechosa. Contacte al administrador.',
        codigo: 'IP_BLOQUEADA'
      });
    }
    
    next();
  };
}