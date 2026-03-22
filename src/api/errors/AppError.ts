/**
 * Clase base para todos los errores personalizados de la aplicación.
 * Extiende Error nativo de JavaScript agregando el código de estado HTTP.
 */
export class AppError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
  }
}

/**
 * 404 — Recurso no encontrado.
 */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

/**
 * 401 — Credenciales inválidas o token ausente.
 */
export class AuthenticationError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

/**
 * 403 — El usuario no tiene permisos para esta acción.
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 403);
  }
}

/**
 * 400 — Error de validación o solicitud incorrecta.
 */
export class ValidationError extends AppError {
  constructor(message = 'Datos inválidos') {
    super(message, 400);
  }
}
