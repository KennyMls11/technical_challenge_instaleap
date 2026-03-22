import { AppDataSource } from '../../config/database';
import { Task, TaskStatus } from '../entities/task.entity';

/**
 * Repositorio de tareas.
 * Extiende el repositorio base de TypeORM con métodos específicos del dominio.
 * Solo maneja acceso a datos — sin lógica de negocio.
 */
export const taskRepository = AppDataSource.getRepository(Task).extend({
  /**
   * Retorna todas las tareas que pertenecen a un usuario específico.
   */
  async findAllByUser(userId: number): Promise<Task[]> {
    return this.find({ where: { userId }, order: { createdAt: 'DESC' } });
  },

  /**
   * Busca una tarea por su ID. Retorna null si no existe.
   */
  async findById(id: number): Promise<Task | null> {
    return this.findOne({ where: { id } });
  },

  /**
   * Crea y persiste una nueva tarea asociada a un usuario.
   */
  async createTask(
    userId: number,
    titulo: string,
    descripcion: string,
    fecha_vencimiento: Date,
  ): Promise<Task> {
    const task = this.create({ userId, titulo, descripcion, fecha_vencimiento, estado: TaskStatus.PENDIENTE });
    return this.save(task);
  },

  /**
   * Actualiza los campos provistos de una tarea existente.
   * Recibe un objeto parcial — solo se actualizan los campos incluidos.
   */
  async updateTask(
    task: Task,
    fields: Partial<Pick<Task, 'titulo' | 'descripcion' | 'fecha_vencimiento' | 'estado'>>,
  ): Promise<Task> {
    Object.assign(task, fields);
    return this.save(task);
  },

  /**
   * Elimina una tarea de la base de datos.
   */
  async deleteTask(task: Task): Promise<void> {
    await this.remove(task);
  },

});
