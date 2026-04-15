import { Request, Response } from 'express';
import pool from '../db';

export async function enviarMensajeController(req: Request, res: Response) {
  try {
    const { titulo, contenido, destinatarioId, paraTodosGerentes } = req.body;
    const remitente = (req as any).usuario;

    if (remitente.rol !== 'ADMIN' && remitente.rol !== 'AUXILIAR') {
      return res.status(403).json({ error: 'No tienes permiso para enviar mensajes' });
    }

    let result;

    if (paraTodosGerentes) {
      result = await pool.query(
        `INSERT INTO "Mensaje" (titulo, contenido, "remitenteId", "paraTodosGerentes")
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [titulo, contenido, remitente.id, true]
      );
    } else {
      result = await pool.query(
        `INSERT INTO "Mensaje" (titulo, contenido, "remitenteId", "destinatarioId")
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [titulo, contenido, remitente.id, destinatarioId]
      );
    }

    res.status(201).json({ mensaje: 'Mensaje enviado', data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function recibirMensajesController(req: Request, res: Response) {
  try {
    const usuario = (req as any).usuario;

    if (usuario.rol === 'ADMIN' || usuario.rol === 'AUXILIAR') {
      const result = await pool.query(`
        SELECT m.*, u.nombre as "remitenteNombre"
        FROM "Mensaje" m
        LEFT JOIN "Usuario" u ON m."remitenteId" = u.id
        ORDER BY m."createdAt" DESC
      `);
      return res.json(result.rows);
    } else {
      const result = await pool.query(
        `
        SELECT m.*, u.nombre as "remitenteNombre"
        FROM "Mensaje" m
        LEFT JOIN "Usuario" u ON m."remitenteId" = u.id
        WHERE m."destinatarioId" = $1 OR m."paraTodosGerentes" = true
        ORDER BY m."createdAt" DESC
        `,
        [usuario.id]
      );
      return res.json(result.rows);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function marcarComoLeidoController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const usuario = (req as any).usuario;

    const result = await pool.query(
      `UPDATE "Mensaje" 
       SET leido = true 
       WHERE id = $1 AND ("destinatarioId" = $2 OR "paraTodosGerentes" = true)
       RETURNING *`,
      [id, usuario.id]
    );

    res.json({ mensaje: 'Mensaje marcado como leído', data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function listarGerentesController(req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT id, nombre, email FROM "Usuario" WHERE rol = 'GERENTE_ZONA' ORDER BY nombre`
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}