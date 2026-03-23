import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

/**
 * Estados posibles de una tarea.
 */
export enum TaskStatus {
  PENDIENTE = 'pendiente',
  EN_CURSO = 'en curso',
  COMPLETADA = 'completada',
}

/**
 * Entidad que representa una tarea creada por un usuario.
 * Cada tarea pertenece a un único usuario.
 */
@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  titulo!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'date' })
  fecha_vencimiento!: Date;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDIENTE,
  })
  estado!: TaskStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  userId!: number;
}
