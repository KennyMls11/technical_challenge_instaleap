import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';

/**
 * Middleware global de manejo de errores.
 * Debe registrarse al final de todos los middlewares en app.ts.
 * Captura cualquier error lanzado en la aplicación y responde con un formato consistente.
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = error instanceof AppError ? error.status : 500;
  const message = error instanceof AppError ? error.message : 'Error interno del servidor';

  res.status(status).json({
    path: req.path,
    message,
    date: new Date().toISOString(),
    status,
  });
}
