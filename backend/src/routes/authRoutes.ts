import { Router } from 'express';
import { loginController, registrarController, meController } from '../controllers/authController';
import { listarUsuariosController, eliminarUsuarioController, asignarZonaController, registrarGerenteController, editarUsuarioController } from '../controllers/usuarioController';
import { autenticar, permitirRoles } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.post('/login', loginController);

// Rutas protegidas
router.get('/me', autenticar, meController);
router.post('/registrar', autenticar, permitirRoles('ADMIN'), registrarController);
router.get('/usuarios', autenticar, permitirRoles('ADMIN'), listarUsuariosController);
router.delete('/usuarios/:id', autenticar, permitirRoles('ADMIN'), eliminarUsuarioController);
router.put('/usuarios/:id', autenticar, permitirRoles('ADMIN'), editarUsuarioController);
router.put('/usuarios/:id/asignar-zona', autenticar, permitirRoles('ADMIN'), asignarZonaController);
router.post('/registrar-gerente', autenticar, permitirRoles('ADMIN'), registrarGerenteController);

export default router;