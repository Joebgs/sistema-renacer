import { Router } from 'express';
import { loginController, registrarController, meController } from '../controllers/authController';
import { listarUsuariosController, eliminarUsuarioController, asignarZonaController } from '../controllers/usuarioController';
import { autenticar, permitirRoles } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.post('/login', loginController);

// Rutas protegidas
router.get('/me', autenticar, meController);
router.post('/registrar', autenticar, permitirRoles('ADMIN'), registrarController);
router.get('/usuarios', autenticar, permitirRoles('ADMIN'), listarUsuariosController);
router.delete('/usuarios/:id', autenticar, permitirRoles('ADMIN'), eliminarUsuarioController);
router.put('/usuarios/:id/asignar-zona', autenticar, permitirRoles('ADMIN'), asignarZonaController);

export default router;