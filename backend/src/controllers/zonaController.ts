/**
 * CONTROLADOR DE ZONAS / REGIONES
 * 
 * Este archivo maneja las operaciones relacionadas con zonas y regiones:
 * - Listar todas las zonas (para usar en selectores del frontend)
 * - Crear nuevas zonas (solo admin)
 * 
 * @module ZonaController
 */

import { Request, Response } from 'express';
import pool from '../db';

/**
 * LISTAR ZONAS
 * 
 * Endpoint: GET /api/zonas
 * 
 * Acceso: Solo ADMIN
 * 
 * Devuelve todas las zonas disponibles con su región asociada
 * para usar en formularios de creación/edición de gerentes
 * 
 * @param req - Petición HTTP
 * @param res - Respuesta HTTP
 */
export async function listarZonasController(req: Request, res: Response) {
  try {
    const result = await pool.query('SELECT id, nombre, region FROM "GerenteZona" ORDER BY id');
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error al listar zonas:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * CREAR NUEVA ZONA
 * 
 * Endpoint: POST /api/zonas
 * 
 * Acceso: Solo ADMIN
 * 
 * Permite crear una nueva zona (gerente) con su región asignada
 * 
 * @param req - Petición HTTP (contiene nombre y region en body)
 * @param res - Respuesta HTTP
 */
export async function crearZonaController(req: Request, res: Response) {
  try {
    const { nombre, region } = req.body;
    const result = await pool.query(
      'INSERT INTO "GerenteZona" (nombre, region) VALUES ($1, $2) RETURNING *',
      [nombre, region]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al crear zona:', error);
    res.status(500).json({ error: error.message });
  }
}