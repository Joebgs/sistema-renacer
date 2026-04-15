import { Request, Response } from 'express';
import pool from '../db';

export async function listarZonasController(req: Request, res: Response) {
  try {
    const result = await pool.query('SELECT id, nombre, region FROM "GerenteZona" ORDER BY id');
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error al listar zonas:', error);
    res.status(500).json({ error: error.message });
  }
}