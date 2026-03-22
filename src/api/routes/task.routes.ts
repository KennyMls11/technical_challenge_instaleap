import { Router } from 'express';
import { taskController } from '../../controllers/task.controller';
import { validateCreateTaskBody, validateUpdateTaskBody } from '../validators/task.validator';
import { authenticate } from '../middlewares/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Endpoints de gestión de tareas (requieren autenticación)
 */
const taskRouter = Router();

// Todas las rutas de tareas requieren autenticación
taskRouter.use(authenticate);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Obtiene todas las tareas del usuario autenticado
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tareas
 *       401:
 *         description: Token no proporcionado o inválido
 */
taskRouter.get('/', taskController.getAll);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Obtiene una tarea por ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tarea encontrada
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: La tarea pertenece a otro usuario
 *       404:
 *         description: Tarea no encontrada
 */
taskRouter.get('/:id', taskController.getOne);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Crea una nueva tarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, descripcion, fecha_vencimiento]
 *             properties:
 *               titulo:
 *                 type: string
 *                 maxLength: 200
 *                 example: Completar informe mensual
 *               descripcion:
 *                 type: string
 *                 example: Preparar el informe de ventas del mes de marzo
 *               fecha_vencimiento:
 *                 type: string
 *                 format: date
 *                 example: '2026-04-01'
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no proporcionado o inválido
 */
taskRouter.post('/', validateCreateTaskBody, taskController.create);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Actualiza una tarea existente
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               fecha_vencimiento:
 *                 type: string
 *                 format: date
 *               estado:
 *                 type: string
 *                 enum: [pendiente, en curso, completada]
 *     responses:
 *       200:
 *         description: Tarea actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: La tarea pertenece a otro usuario
 *       404:
 *         description: Tarea no encontrada
 */
taskRouter.put('/:id', validateUpdateTaskBody, taskController.update);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Elimina una tarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tarea eliminada exitosamente
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: La tarea pertenece a otro usuario
 *       404:
 *         description: Tarea no encontrada
 */
taskRouter.delete('/:id', taskController.remove);

export default taskRouter;
