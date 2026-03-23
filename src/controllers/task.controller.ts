import { NextFunction, Request, Response } from 'express';
import { taskService } from '../services/task.service';
import { sendSuccess } from '../api/helpers/response';
import { TaskStatus } from '../persistence/entities/task.entity';

/**
 * Controller de tareas.
 * Extrae inputs de req, delega al servicio y responde.
 * No contiene lógica de negocio.
 */
export const taskController = {
  /**
   * GET /api/v1/tasks
   * Retorna todas las tareas del usuario autenticado.
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const estado = req.query.estado as string | undefined;
      const tasks = await taskService.getAll(userId, estado);
      sendSuccess(res, 'Tareas obtenidas exitosamente', tasks);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/tasks/:id
   * Retorna una tarea específica del usuario autenticado.
   */
  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = Number(req.params.id);
      const userId = req.user!.id;
      const task = await taskService.getOne(taskId, userId);
      sendSuccess(res, 'Tarea obtenida exitosamente', task);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/tasks
   * Crea una nueva tarea para el usuario autenticado.
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { titulo, descripcion, fecha_vencimiento } = req.body as {
        titulo: string;
        descripcion: string;
        fecha_vencimiento: string;
      };
      const task = await taskService.create(userId, { titulo, descripcion, fecha_vencimiento });
      sendSuccess(res, 'Tarea creada exitosamente', task, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/tasks/:id
   * Actualiza una tarea existente del usuario autenticado.
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = Number(req.params.id);
      const userId = req.user!.id;
      const { titulo, descripcion, fecha_vencimiento, estado } = req.body as {
        titulo?: string;
        descripcion?: string;
        fecha_vencimiento?: string;
        estado?: TaskStatus;
      };
      const task = await taskService.update(taskId, userId, { titulo, descripcion, fecha_vencimiento, estado });
      sendSuccess(res, 'Tarea actualizada exitosamente', task);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/tasks/:id
   * Elimina una tarea del usuario autenticado.
   */
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = Number(req.params.id);
      const userId = req.user!.id;
      await taskService.remove(taskId, userId);
      sendSuccess(res, 'Tarea eliminada exitosamente');
    } catch (error) {
      next(error);
    }
  },
};
