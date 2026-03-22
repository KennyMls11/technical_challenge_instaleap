import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../errors/AppError';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const createTaskSchema = {
  type: 'object',
  properties: {
    titulo:            { type: 'string', minLength: 1, maxLength: 200 },
    descripcion:       { type: 'string', minLength: 1 },
    fecha_vencimiento: { type: 'string', format: 'date' }, // 'YYYY-MM-DD'
  },
  required: ['titulo', 'descripcion', 'fecha_vencimiento'],
  additionalProperties: false,
};

const updateTaskSchema = {
  type: 'object',
  properties: {
    titulo:            { type: 'string', minLength: 1, maxLength: 200 },
    descripcion:       { type: 'string', minLength: 1 },
    fecha_vencimiento: { type: 'string', format: 'date' },
    estado:            { type: 'string', enum: ['pendiente', 'en curso', 'completada'] },
  },
  required: [],
  additionalProperties: false,
  minProperties: 1, // al menos un campo debe venir para que el update tenga sentido
};

// Compilados una sola vez al importar el módulo, no en cada request
const validateCreate = ajv.compile(createTaskSchema);
const validateUpdate = ajv.compile(updateTaskSchema);

/**
 * Valida el cuerpo de la petición de creación de tarea.
 */
export function validateCreateTaskBody(req: Request, _res: Response, next: NextFunction): void {
  const valid = validateCreate(req.body);
  if (!valid) {
    const messages = validateCreate.errors!.map((e) => e.message).join(', ');
    return next(new ValidationError(`Datos inválidos: ${messages}`));
  }
  next();
}

/**
 * Valida el cuerpo de la petición de actualización de tarea.
 * Todos los campos son opcionales, pero al menos uno debe estar presente.
 */
export function validateUpdateTaskBody(req: Request, _res: Response, next: NextFunction): void {
  const valid = validateUpdate(req.body);
  if (!valid) {
    const messages = validateUpdate.errors!.map((e) => e.message).join(', ');
    return next(new ValidationError(`Datos inválidos: ${messages}`));
  }
  next();
}
