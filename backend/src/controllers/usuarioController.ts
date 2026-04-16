import { Request, Response } from 'express';
import pool from '../db';
import bcrypt from 'bcryptjs';

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

export async function registrarGerenteController(req: Request, res: Response) {
  try {
    const { email, nombre, password, region } = req.body;

    if (!region || (region !== 'Portuguesa' && region !== 'Cojedes')) {
      return res.status(400).json({ error: 'Región inválida. Debe ser Portuguesa o Cojedes' });
    }

    const existe = await pool.query('SELECT id FROM "Usuario" WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const zonaResult = await pool.query(
      'INSERT INTO "GerenteZona" (nombre, region) VALUES ($1, $2) RETURNING id',
      [nombre, region]
    );
    const gerenteZonaId = zonaResult.rows[0].id;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

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

export async function editarUsuarioController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { email, nombre, rol, region } = req.body;

    const existe = await pool.query(
      'SELECT id FROM "Usuario" WHERE email = $1 AND id != $2',
      [email, id]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está en uso por otro usuario' });
    }

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