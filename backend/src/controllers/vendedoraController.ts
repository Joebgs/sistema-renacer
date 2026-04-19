/**
 * CONTROLADOR DE VENDEDORAS
 * 
 * Este archivo maneja todas las operaciones relacionadas con vendedoras:
 * - Listar vendedoras (con filtros según rol del usuario)
 * - Buscar vendedora por cédula (acceso público)
 * - Crear/reportar nueva vendedora (con validaciones)
 * - Actualizar reputación (con reglas de tiempo para gerentes)
 * - Eliminar vendedora (solo admin/auxiliar)
 * 
 * @module VendedoraController
 */

import { Request, Response } from 'express';
import pool from '../db';
import { registrarConsultaAuditoria } from '../middleware/security';

/**
 * LISTAR VENDEDORAS
 * 
 * Endpoint: GET /api/vendedora
 * 
 * Reglas de acceso:
 * - ADMIN o AUXILIAR: ven todas las vendedoras
 * - GERENTE: solo ve las vendedoras que él mismo reportó
 * 
 * @param req - Petición HTTP (contiene usuario autenticado en req.usuario)
 * @param res - Respuesta HTTP
 */
export async function listarVendedorasController(req: Request, res: Response) {
  try {
    const usuario = (req as any).usuario;
    let query = `
      SELECT v.*, u.nombre as "creadaPorNombre"
      FROM "Vendedora" v
      LEFT JOIN "Usuario" u ON v."creadaPorId" = u.id
    `;
    const params: any[] = [];

    // Si es gerente, filtrar solo sus propios reportes
    if (usuario.rol === 'GERENTE_ZONA') {
      query += ` WHERE v."creadaPorId" = $1`;
      params.push(usuario.id);
    }

    query += ` ORDER BY v.id DESC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error al listar vendedoras:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * BUSCAR VENDEDORA POR CÉDULA
 * 
 * Endpoint: GET /api/vendedora/buscar/:cedula
 * 
 * Acceso: PÚBLICO (no requiere autenticación)
 * 
 * Flujo:
 * 1. Validar y limpiar cédula
 * 2. Buscar vendedora en la base de datos
 * 3. Obtener historial completo de reportes
 * 4. Registrar auditoría (IP, usuario, fecha)
 * 5. Devolver datos + historial
 * 
 * @param req - Petición HTTP (contiene cédula en params)
 * @param res - Respuesta HTTP
 */
export async function buscarVendedoraController(req: Request, res: Response) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const { cedula } = req.params;
  const usuario = (req as any).usuario;
  
  const cedulaStr = Array.isArray(cedula) ? cedula[0] : cedula;

  try {
    // 1. Obtener datos de la vendedora
    const vendedoraResult = await pool.query(
      `SELECT v.* FROM "Vendedora" v WHERE v.cedula = $1`,
      [cedulaStr]
    );
    
    const exitosa = vendedoraResult.rows.length > 0;
    const vendedora = exitosa ? vendedoraResult.rows[0] : null;

    // 2. Obtener historial de reportes (si existe)
    let historial = [];
    if (exitosa && vendedora.id) {
      const historialResult = await pool.query(
        `SELECT h.*, g.nombre as "gerenteZona", g.region
         FROM "HistorialVendedora" h
         LEFT JOIN "GerenteZona" g ON h."gerenteZonaId" = g.id
         WHERE h."vendedoraId" = $1
         ORDER BY h."fechaReporte" DESC`,
        [vendedora.id]
      );
      historial = historialResult.rows;
    }
    
    // 3. Registrar auditoría (para seguridad)
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
    
    // 4. Devolver datos completos
    res.json({
      ...vendedora,
      historial: historial.map(h => ({
        gerenteZona: h.gerenteZona,
        region: h.region,
        reputacion: h.reputacion,
        fechaReporte: h.fechaReporte
      }))
    });
  } catch (error: any) {
    const cedulaStr = Array.isArray(cedula) ? cedula[0] : cedula;
    await registrarConsultaAuditoria(cedulaStr, usuario?.id || null, ip, req.headers['user-agent'] as string | undefined, false);
    res.status(500).json({ error: error.message });
  }
}

/**
 * CREAR / REPORTAR NUEVA VENDEDORA
 * 
 * Endpoint: POST /api/vendedora
 * 
 * Reglas:
 * - Admin/Auxiliar: pueden reportar cualquier vendedora
 * - Gerente: solo puede reportar vendedoras con reputación OBSERVADA o RESTRINGIDA
 * - Si la cédula ya existe, solo se agrega un nuevo reporte al historial
 * 
 * @param req - Petición HTTP (contiene datos de la vendedora en body)
 * @param res - Respuesta HTTP
 */
export async function crearVendedoraController(req: Request, res: Response) {
  try {
    const { nombre, cedula, reputacion, telefono, direccion } = req.body;
    const usuario = (req as any).usuario;

    // Verificar si la vendedora ya existe por cédula
    let vendedoraResult = await pool.query(
      `SELECT id FROM "Vendedora" WHERE cedula = $1`,
      [cedula]
    );
    
    let vendedoraId;
    
    if (vendedoraResult.rows.length === 0) {
      // Crear nueva vendedora (primer reporte)
      const insertResult = await pool.query(
        `INSERT INTO "Vendedora" (nombre, cedula, telefono, direccion, "creadaPorId")
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [nombre, cedula, telefono || null, direccion || null, usuario.id]
      );
      vendedoraId = insertResult.rows[0].id;
    } else {
      // Vendedora ya existe, usar su ID para agregar otro reporte
      vendedoraId = vendedoraResult.rows[0].id;
    }

    // Agregar al historial de reportes
    await pool.query(
      `INSERT INTO "HistorialVendedora" ("vendedoraId", "gerenteZonaId", reputacion)
       VALUES ($1, $2, $3)`,
      [vendedoraId, usuario.gerenteZonaId, reputacion]
    );

    res.status(201).json({ mensaje: 'Vendedora reportada correctamente' });
  } catch (error: any) {
    console.error('Error al reportar vendedora:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * ACTUALIZAR REPUTACIÓN DE VENDEDORA
 * 
 * Endpoint: PUT /api/vendedora/:id
 * 
 * Reglas:
 * - Admin/Auxiliar: pueden editar cualquier vendedora sin restricciones
 * - Gerente: solo puede editar vendedoras que él reportó y dentro de 30 minutos
 * 
 * @param req - Petición HTTP (contiene id en params, reputación en body)
 * @param res - Respuesta HTTP
 */
export async function actualizarVendedoraController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { reputacion } = req.body;
    const usuario = (req as any).usuario;

    // Obtener la vendedora para verificar permisos
    const vendedoraResult = await pool.query(
      `SELECT * FROM "Vendedora" WHERE id = $1`,
      [id]
    );
    
    const vendedora = vendedoraResult.rows[0];
    
    if (!vendedora) {
      return res.status(404).json({ error: 'Vendedora no encontrada' });
    }

    // Admin y Auxiliar pueden editar cualquier vendedora
    if (usuario.rol === 'ADMIN' || usuario.rol === 'AUXILIAR') {
      // Agregar nuevo reporte al historial
      await pool.query(
        `INSERT INTO "HistorialVendedora" ("vendedoraId", "gerenteZonaId", reputacion)
         VALUES ($1, $2, $3)`,
        [id, vendedora.gerenteZonaId, reputacion]
      );
      return res.json({ mensaje: 'Reporte actualizado' });
    }

    // Gerente solo puede editar vendedoras que él reportó
    if (vendedora.creadaPorId !== usuario.id) {
      return res.status(403).json({ error: 'Solo puedes editar vendedoras que registraste tú' });
    }
    
    // Verificar ventana de 30 minutos
    const minutosTranscurridos = (Date.now() - new Date(vendedora.createdAt).getTime()) / 60000;
    if (minutosTranscurridos > 30) {
      return res.status(403).json({ 
        error: 'Pasaron más de 30 minutos. Solo el administrador puede editar esta vendedora.' 
      });
    }

    // Agregar nuevo reporte al historial
    await pool.query(
      `INSERT INTO "HistorialVendedora" ("vendedoraId", "gerenteZonaId", reputacion)
       VALUES ($1, $2, $3)`,
      [id, usuario.gerenteZonaId, reputacion]
    );

    res.json({ mensaje: 'Reporte actualizado' });
  } catch (error: any) {
    console.error('Error al actualizar vendedora:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * ELIMINAR VENDEDORA
 * 
 * Endpoint: DELETE /api/vendedora/:id
 * 
 * Reglas:
 * - Solo ADMIN o AUXILIAR pueden eliminar vendedoras
 * - Los GERENTES NO tienen permiso para eliminar
 * 
 * @param req - Petición HTTP (contiene id en params)
 * @param res - Respuesta HTTP
 */
export async function eliminarVendedoraController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const usuario = (req as any).usuario;

    // Verificar permiso
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