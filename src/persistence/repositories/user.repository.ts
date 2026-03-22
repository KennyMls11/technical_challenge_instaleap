import { AppDataSource } from '../../config/database';
import { User } from '../entities/user.entity';

/**
 * Repositorio de acceso a datos para la entidad User.
 * Solo contiene operaciones de lectura y escritura contra la base de datos.
 * No contiene lógica de negocio.
 */
export const userRepository = AppDataSource.getRepository(User).extend({
  /**
   * Busca un usuario por su email.
   * Retorna null si no existe.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  },

  /**
   * Crea y persiste un nuevo usuario.
   * El password recibido ya debe estar hasheado.
   */
  async createUser(nombre: string, email: string, hashedPassword: string): Promise<User> {
    const user = this.create({ nombre, email, password: hashedPassword });
    return this.save(user);
  },
});
