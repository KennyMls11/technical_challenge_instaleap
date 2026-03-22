import { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../api/helpers/response';

/**
 * Controller de autenticación.
 * Responsable únicamente de orquestar: extrae inputs, delega al service, responde.
 * No contiene lógica de negocio.
 */
export const authController = {
  /**
   * POST /api/v1/auth/register
   * Registra un nuevo usuario. No retorna token.
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nombre, email, password } = req.body as {
        nombre: string;
        email: string;
        password: string;
      };

      const user = await authService.register(nombre, email, password);
      sendSuccess(res, 'Usuario registrado exitosamente', user, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/login
   * Autentica al usuario y retorna el access token JWT.
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };

      const result = await authService.login(email, password);
      sendSuccess(res, 'Login exitoso', result);
    } catch (error) {
      next(error);
    }
  },
};
