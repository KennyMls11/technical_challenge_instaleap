import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { envConfig } from '../../config/env';
import { AuthenticationError } from '../errors/AppError';
import { JwtPayload } from '../../services/auth.service';

// Extiende el tipo Request de Express para incluir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

/**
 * Middleware de autenticación JWT.
 * Lee el token desde la cabecera Authorization: Bearer <token>,
 * lo verifica y adjunta los datos del usuario a req.user.
 * Lanza AuthenticationError si el token falta o es inválido.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthenticationError('Token no proporcionado'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, envConfig.jwtSecret) as JwtPayload;
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new AuthenticationError('Token inválido o expirado'));
  }
}
