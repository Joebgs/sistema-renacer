import { Router } from 'express';
import { listarZonasController } from '../controllers/zonaController';
import { autenticar, permitirRoles } from '../middleware/auth';

const router = Router();

router.get('/', autenticar, permitirRoles('ADMIN'), listarZonasController);

export default router;