import { Router } from 'express';
import { autenticar, permitirRoles } from '../middleware/auth';
import pool from '../db';

const router = Router();

router.get('/ips-bloqueadas', autenticar, permitirRoles('ADMIN'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM "IPBloqueada" ORDER BY "fechaBloqueo" DESC`
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/auditoria', autenticar, permitirRoles('ADMIN'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM "AuditoriaConsulta" ORDER BY fecha DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/desbloquear-ip', autenticar, permitirRoles('ADMIN'), async (req, res) => {
  try {
    const { ip } = req.body;
    await pool.query(`DELETE FROM "IPBloqueada" WHERE ip = $1`, [ip]);
    res.json({ mensaje: 'IP desbloqueada correctamente' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;