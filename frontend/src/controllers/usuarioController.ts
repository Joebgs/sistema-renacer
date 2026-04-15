import { Request, Response } from 'express';
import pool from '../db';

export async function listarUsuariosController(req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT id, email, nombre, rol, "gerenteZonaId", activo, "createdAt" 
       FROM "Usuario" 
       ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function eliminarUsuarioController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM "Usuario" WHERE id = $1 RETURNING *`, [id]);
    res.json({ mensaje: 'Usuario eliminado', usuario: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}