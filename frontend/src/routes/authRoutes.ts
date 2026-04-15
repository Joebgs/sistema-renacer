import { Router } from 'express';
import { loginController, registrarController, meController } from '../controllers/authController';
import { listarUsuariosController, eliminarUsuarioController } from '../controllers/usuarioController';
import { autenticar, permitirRoles } from '../middleware/auth';

const router = Router();

// Públicas
router.post('/login', loginController);

// Protegidas
router.get('/me', autenticar, meController);
router.post('/registrar', autenticar, permitirRoles('ADMIN'), registrarController);
router.get('/usuarios', autenticar, permitirRoles('ADMIN'), listarUsuariosController);
router.delete('/usuarios/:id', autenticar, permitirRoles('ADMIN'), eliminarUsuarioController);

export default router;