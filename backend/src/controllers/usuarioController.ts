/**
 * CONTROLADOR DE USUARIOS
 * 
 * Este archivo maneja todas las operaciones relacionadas con usuarios:
 * - Listar usuarios (con filtro por rol opcional)
 * - Eliminar usuarios (con protección para admin)
 * - Asignar zona a gerente
 * - Registrar nuevos gerentes de zona (con región)
 * - Editar usuarios existentes
 * 
 * @module UsuarioController
 */

import { Request, Response } from 'express';
import pool from '../db';
import bcrypt from 'bcryptjs';

/**
 * LISTAR USUARIOS
 * 
 * Endpoint: GET /api/auth/usuarios
 * 
 * Acceso: Solo ADMIN
 * 
 * Filtros:
 * - ?rol=GERENTE_ZONA (opcional) para filtrar por rol
 * 
 * @param req - Petición HTTP (contiene query param ?rol)
 * @param res - Respuesta HTTP
 */
export async function listarUsuariosController(req: Request, res: Response) {
  try {
    const { rol } = req.query;
    
    let query = `
      SELECT u.id, u.email, u.nombre, u.rol, u.activo, u."createdAt",
             g.nombre as "gerenteZona", g.id as "gerenteZonaId", g.region
      FROM "Usuario" u
      LEFT JOIN "GerenteZona" g ON u."gerenteZonaId" = g.id
    `;
    
    const params: any[] = [];
    
    // Filtrar por rol si se proporciona
    if (rol) {
      query += ` WHERE u.rol = $1`;
      params.push(rol);
    }
    
    query += ` ORDER BY u.id DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * ELIMINAR USUARIO
 * 
 * Endpoint: DELETE /api/auth/usuarios/:id
 * 
 * Acceso: Solo ADMIN
 * 
 * Protección:
 * - No se puede eliminar al usuario ADMIN
 * 
 * @param req - Petición HTTP (contiene id en params)
 * @param res - Respuesta HTTP
 */
export async function eliminarUsuarioController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Obtener información del usuario antes de eliminar
    const usuario = await pool.query(
      'SELECT "gerenteZonaId", rol FROM "Usuario" WHERE id = $1',
      [id]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const gerenteZonaId = usuario.rows[0].gerenteZonaId;
    const rol = usuario.rows[0].rol;

    // Eliminar el usuario (protegido: no se puede eliminar admin)
    const result = await pool.query(
      'DELETE FROM "Usuario" WHERE id = $1 AND rol != $2 RETURNING *',
      [id, 'ADMIN']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado o no se puede eliminar' });
    }

    // Si era gerente de zona, eliminar también de GerenteZona (cascade ya configurado)
    if (rol === 'GERENTE_ZONA' && gerenteZonaId) {
      await pool.query('DELETE FROM "GerenteZona" WHERE id = $1', [gerenteZonaId]);
      console.log(`🗑️ GerenteZona id ${gerenteZonaId} eliminado`);
    }

    res.json({ mensaje: 'Usuario eliminado correctamente', usuario: result.rows[0] });
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * ASIGNAR ZONA A GERENTE
 * 
 * Endpoint: PUT /api/auth/usuarios/:id/asignar-zona
 * 
 * Acceso: Solo ADMIN
 * 
 * @param req - Petición HTTP (contiene id en params, gerenteZonaId en body)
 * @param res - Respuesta HTTP
 */
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
    console.error('Error al asignar zona:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * REGISTRAR NUEVO GERENTE DE ZONA
 * 
 * Endpoint: POST /api/auth/registrar-gerente
 * 
 * Acceso: Solo ADMIN
 * 
 * Flujo:
 * 1. Validar región (Portuguesa o Cojedes)
 * 2. Verificar email no existente
 * 3. Crear registro en GerenteZona
 * 4. Hashear contraseña
 * 5. Crear usuario con rol GERENTE_ZONA vinculado a la zona
 * 
 * @param req - Petición HTTP (contiene email, nombre, password, region en body)
 * @param res - Respuesta HTTP
 */
export async function registrarGerenteController(req: Request, res: Response) {
  try {
    const { email, nombre, password, region } = req.body;

    // Validar región
    if (!region || (region !== 'Portuguesa' && region !== 'Cojedes')) {
      return res.status(400).json({ error: 'Región inválida. Debe ser Portuguesa o Cojedes' });
    }

    // Verificar si el email ya existe
    const existe = await pool.query('SELECT id FROM "Usuario" WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // 1. Crear el gerente de zona
    const zonaResult = await pool.query(
      'INSERT INTO "GerenteZona" (nombre, region) VALUES ($1, $2) RETURNING id',
      [nombre, region]
    );
    const gerenteZonaId = zonaResult.rows[0].id;

    // 2. Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Crear el usuario
    const usuarioResult = await pool.query(
      `INSERT INTO "Usuario" (email, nombre, password, rol, "gerenteZonaId")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, nombre, rol`,
      [email, nombre, passwordHash, 'GERENTE_ZONA', gerenteZonaId]
    );

    res.status(201).json({
      id: usuarioResult.rows[0].id,
      email: usuarioResult.rows[0].email,
      nombre: usuarioResult.rows[0].nombre,
      rol: usuarioResult.rows[0].rol,
      region
    });
  } catch (error: any) {
    console.error('Error al registrar gerente:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * EDITAR USUARIO EXISTENTE
 * 
 * Endpoint: PUT /api/auth/usuarios/:id
 * 
 * Acceso: Solo ADMIN
 * 
 * Permite editar:
 * - Email
 * - Nombre
 * - Rol
 * - Región (si es gerente de zona)
 * 
 * @param req - Petición HTTP (contiene id en params, datos en body)
 * @param res - Respuesta HTTP
 */
export async function editarUsuarioController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { email, nombre, rol, region } = req.body;

    // Verificar si el email ya existe (excluyendo el usuario actual)
    const existe = await pool.query(
      'SELECT id FROM "Usuario" WHERE email = $1 AND id != $2',
      [email, id]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está en uso por otro usuario' });
    }

    // Actualizar usuario
    const usuarioResult = await pool.query(
      `UPDATE "Usuario" 
       SET email = $1, nombre = $2, rol = $3
       WHERE id = $4
       RETURNING id, email, nombre, rol, "gerenteZonaId"`,
      [email, nombre, rol, id]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si es gerente de zona, actualizar también la región en GerenteZona
    if (rol === 'GERENTE_ZONA' && usuarioResult.rows[0].gerenteZonaId && region) {
      await pool.query(
        'UPDATE "GerenteZona" SET region = $1 WHERE id = $2',
        [region, usuarioResult.rows[0].gerenteZonaId]
      );
    }

    res.json({ 
      mensaje: 'Usuario actualizado correctamente', 
      usuario: usuarioResult.rows[0] 
    });
  } catch (error: any) {
    console.error('Error al editar usuario:', error);
    res.status(500).json({ error: error.message });
  }
}