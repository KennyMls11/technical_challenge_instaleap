import express, { Application } from 'express';
import { errorHandler } from './api/middlewares/errorHandler';
import authRouter from './api/routes/auth.routes';

/**
 * Instancia de Express con middlewares base configurados.
 * Las rutas de la API se montarán aquí a medida que se implementen.
 */
const app: Application = express();

// Middlewares base
app.use(express.json());

// Health check — permite verificar que el servidor está corriendo
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rutas de la API
app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/tasks', taskRoutes); // próximo paso

// Manejo de errores — debe ir siempre al final
app.use(errorHandler);

export default app;
