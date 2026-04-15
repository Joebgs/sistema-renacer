import { Request, Response } from 'express';
import pool from '../db';

export async function listarUsuariosController(req: Request, res: Response) {
  try {
    const result = await pool.query(`
      SELECT u.id, u.email, u.nombre, u.rol, u.activo, u."createdAt",
             g.nombre as "gerenteZona", g.id as "gerenteZonaId"
      FROM "Usuario" u
      LEFT JOIN "GerenteZona" g ON u."gerenteZonaId" = g.id
      ORDER BY u.id DESC
    `);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function eliminarUsuarioController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM "Usuario" WHERE id = $1 AND rol != $2 RETURNING *',
      [id, 'ADMIN']
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado o no se puede eliminar' });
    }
    
    res.json({ mensaje: 'Usuario eliminado', usuario: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function asignarZonaController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { gerenteZonaId } = req.body;
    
    const result = await pool.query(
      'UPDATE "Usuario" SET "gerenteZonaId" = $1 WHERE id = $2 AND rol = $3 RETURNING *',
      [gerenteZonaId, id, 'GERENTE_ZONA']
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado o no es gerente' });
    }
    
    res.json({ mensaje: 'Zona asignada correctamente', usuario: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}