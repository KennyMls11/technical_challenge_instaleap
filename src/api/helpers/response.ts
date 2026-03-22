import { Response } from 'express';

/**
 * Envía una respuesta exitosa estandarizada.
 * @param res - Objeto Response de Express
 * @param message - Mensaje descriptivo del resultado
 * @param data - Datos a retornar (opcional)
 * @param status - Código HTTP (200 por defecto)
 */
export function sendSuccess(
  res: Response,
  message: string,
  data?: unknown,
  status = 200
): void {
  const body: { message: string; status: number; data?: unknown } = { message, status };

  if (data !== undefined) {
    body.data = data;
  }

  res.status(status).json(body);
}
