import { Router } from 'express';
import { authController } from '../../controllers/auth.controller';
import { validateRegisterBody, validateLoginBody } from '../validators/auth.validator';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación de usuarios
 */
const authRouter = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, password]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: secret123
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos o email ya registrado
 */
authRouter.post('/register', validateRegisterBody, authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Autentica al usuario y retorna un JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login exitoso, retorna accessToken
 *       401:
 *         description: Credenciales inválidas
 */
authRouter.post('/login', validateLoginBody, authController.login);

export default authRouter;
