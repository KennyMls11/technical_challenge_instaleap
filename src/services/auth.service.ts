import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env';
import { userRepository } from '../persistence/repositories/user.repository';
import { AuthenticationError, ValidationError } from '../api/errors/AppError';
import { User } from '../persistence/entities/user.entity';

const SALT_ROUNDS = 12;

/**
 * Datos públicos del usuario que se exponen en las respuestas.
 * Nunca incluye el campo password.
 */
export interface UserPublicData {
  id: number;
  nombre: string;
  email: string;
  createdAt: Date;
}

/**
 * Payload codificado dentro del JWT.
 */
export interface JwtPayload {
  sub: number;
  email: string;
}

/**
 * Resultado devuelto al hacer login exitoso.
 */
export interface LoginResult {
  accessToken: string;
  user: UserPublicData;
}

/**
 * Convierte una entidad User en un objeto público sin datos sensibles.
 */
function toPublicData(user: User): UserPublicData {
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    createdAt: user.createdAt,
  };
}

/**
 * Servicio de autenticación.
 * Contiene la lógica de negocio para registro y login de usuarios.
 * No importa nada de Express.
 */
export const authService = {
  /**
   * Registra un nuevo usuario en el sistema.
   * Lanza ValidationError si el email ya existe.
   */
  async register(nombre: string, email: string, password: string): Promise<UserPublicData> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ValidationError('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.createUser(nombre, email, hashedPassword);

    return toPublicData(user);
  },

  /**
   * Autentica al usuario y retorna un JWT de acceso.
   * El mensaje de error es genérico para prevenir enumeración de usuarios.
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Credenciales inválidas');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AuthenticationError('Credenciales inválidas');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = jwt.sign(payload, envConfig.jwtSecret, {
      expiresIn: envConfig.jwtExpiresIn,
    });

    return {
      accessToken,
      user: toPublicData(user),
    };
  },
};
