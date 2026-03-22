import { taskRepository } from '../persistence/repositories/task.repository';
import { Task, TaskStatus } from '../persistence/entities/task.entity';
import { NotFoundError, AuthorizationError } from '../api/errors/AppError';

export interface CreateTaskInput {
  titulo: string;
  descripcion: string;
  fecha_vencimiento: string; // ISO date string: 'YYYY-MM-DD'
}

export interface UpdateTaskInput {
  titulo?: string;
  descripcion?: string;
  fecha_vencimiento?: string;
  estado?: TaskStatus;
}

/**
 * Servicio de tareas.
 * Contiene toda la lógica de negocio relacionada con tareas.
 * No importa ni depende de Express.
 */
export const taskService = {
  /**
   * Retorna todas las tareas del usuario autenticado.
   */
  async getAll(userId: number): Promise<Task[]> {
    return taskRepository.findAllByUser(userId);
  },

  /**
   * Retorna una tarea por ID, verificando que pertenezca al usuario autenticado.
   * Lanza NotFoundError si no existe, AuthorizationError si pertenece a otro usuario.
   */
  async getOne(taskId: number, userId: number): Promise<Task> {
    const task = await taskRepository.findById(taskId);

    if (!task) throw new NotFoundError('Tarea no encontrada');
    if (task.userId !== userId) throw new AuthorizationError('No tienes permiso para acceder a esta tarea');

    return task;
  },

  /**
   * Crea una nueva tarea para el usuario autenticado.
   */
  async create(userId: number, input: CreateTaskInput): Promise<Task> {
    const fecha = new Date(input.fecha_vencimiento);
    return taskRepository.createTask(userId, input.titulo, input.descripcion, fecha);
  },

  /**
   * Actualiza una tarea existente. Solo modifica los campos que se envíen.
   * Verifica propiedad antes de actualizar.
   */
  async update(taskId: number, userId: number, input: UpdateTaskInput): Promise<Task> {
    const task = await this.getOne(taskId, userId);

    const fields: Partial<Pick<Task, 'titulo' | 'descripcion' | 'fecha_vencimiento' | 'estado'>> = {};

    if (input.titulo !== undefined) fields.titulo = input.titulo;
    if (input.descripcion !== undefined) fields.descripcion = input.descripcion;
    if (input.fecha_vencimiento !== undefined) fields.fecha_vencimiento = new Date(input.fecha_vencimiento);
    if (input.estado !== undefined) fields.estado = input.estado;

    return taskRepository.updateTask(task, fields);
  },

  /**
   * Elimina una tarea. Verifica propiedad antes de eliminar.
   */
  async remove(taskId: number, userId: number): Promise<void> {
    const task = await this.getOne(taskId, userId);
    await taskRepository.deleteTask(task);
  },
};
