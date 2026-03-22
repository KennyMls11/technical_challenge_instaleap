import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../errors/AppError';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

interface RegisterBody {
  nombre: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

const registerSchema: JSONSchemaType<RegisterBody> = {
  type: 'object',
  properties: {
    nombre:   { type: 'string', minLength: 2, maxLength: 100 },
    email:    { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
  },
  required: ['nombre', 'email', 'password'],
  additionalProperties: false,
};

const loginSchema: JSONSchemaType<LoginBody> = {
  type: 'object',
  properties: {
    email:    { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 1 },
  },
  required: ['email', 'password'],
  additionalProperties: false,
};

// Compilados una sola vez al importar el módulo, no en cada request
const validateRegister = ajv.compile(registerSchema);
const validateLogin    = ajv.compile(loginSchema);

/**
 * Valida el cuerpo de la petición de registro.
 * Pasa ValidationError al errorHandler si los datos no son correctos.
 */
export function validateRegisterBody(req: Request, _res: Response, next: NextFunction): void {
  const valid = validateRegister(req.body);
  if (!valid) {
    const messages = validateRegister.errors!.map((e) => e.message).join(', ');
    return next(new ValidationError(`Datos inválidos: ${messages}`));
  }
  next();
}

/**
 * Valida el cuerpo de la petición de login.
 * Pasa ValidationError al errorHandler si los datos no son correctos.
 */
export function validateLoginBody(req: Request, _res: Response, next: NextFunction): void {
  const valid = validateLogin(req.body);
  if (!valid) {
    const messages = validateLogin.errors!.map((e) => e.message).join(', ');
    return next(new ValidationError(`Datos inválidos: ${messages}`));
  }
  next();
}
