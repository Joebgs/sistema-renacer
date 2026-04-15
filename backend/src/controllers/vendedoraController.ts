import { Request, Response } from 'express';
import pool from '../db';
import { registrarConsultaAuditoria } from '../middleware/security';

export async function listarVendedorasController(req: Request, res: Response) {
  try {
    const result = await pool.query(`
      SELECT v.*, g.nombre as "gerenteZona" 
      FROM "Vendedora" v
      LEFT JOIN "GerenteZona" g ON v."gerenteZonaId" = g.id
      ORDER BY v.id DESC
    `);
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error al listar vendedoras:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function buscarVendedoraController(req: Request, res: Response) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const { cedula } = req.params;
  const usuario = (req as any).usuario;
  
  // Asegurar que cedula sea string
  const cedulaStr = Array.isArray(cedula) ? cedula[0] : cedula;

  try {
    const result = await pool.query(
      `SELECT v.*, g.nombre as "gerenteZona" 
       FROM "Vendedora" v
       LEFT JOIN "GerenteZona" g ON v."gerenteZonaId" = g.id
       WHERE v.cedula = $1`,
      [cedulaStr]
    );
    
    const exitosa = result.rows.length > 0;
    
    // Registrar auditoría
    await registrarConsultaAuditoria(
      cedulaStr, 
      usuario?.id || null, 
      ip, 
      req.headers['user-agent'] as string | undefined, 
      exitosa
    );
    
    if (!exitosa) {
      return res.status(404).json({ mensaje: 'Vendedora no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    const cedulaStr = Array.isArray(cedula) ? cedula[0] : cedula;
    await registrarConsultaAuditoria(cedulaStr, usuario?.id || null, ip, req.headers['user-agent'] as string | undefined, false);
    res.status(500).json({ error: error.message });
  }
}

export async function crearVendedoraController(req: Request, res: Response) {
  try {
    const { nombre, cedula, reputacion, gerenteZonaId } = req.body;
    const usuario = (req as any).usuario;
    
    const result = await pool.query(
      `INSERT INTO "Vendedora" (nombre, cedula, reputacion, "gerenteZonaId", "creadaPorId")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre, cedula, reputacion, gerenteZonaId || null, usuario.id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al crear vendedora:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function actualizarVendedoraController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { reputacion, gerenteZonaId } = req.body;
    
    const result = await pool.query(
      `UPDATE "Vendedora" 
       SET reputacion = COALESCE($1, reputacion),
           "gerenteZonaId" = COALESCE($2, "gerenteZonaId"),
           "updatedAt" = NOW()
       WHERE id = $3
       RETURNING *`,
      [reputacion, gerenteZonaId, id]
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al actualizar vendedora:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function eliminarVendedoraController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const usuario = (req as any).usuario;

    if (usuario.rol !== 'ADMIN' && usuario.rol !== 'AUXILIAR') {
      return res.status(403).json({ error: 'No tienes permiso para eliminar vendedoras' });
    }
    
    const result = await pool.query(
      `DELETE FROM "Vendedora" WHERE id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendedora no encontrada' });
    }
    
    res.json({ mensaje: 'Vendedora eliminada', vendedora: result.rows[0] });
  } catch (error: any) {
    console.error('Error al eliminar vendedora:', error);
    res.status(500).json({ error: error.message });
  }
}