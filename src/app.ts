import express, { Application } from 'express';

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

// Rutas de la API (se descomentarán en los próximos pasos)
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/tasks', taskRoutes);

export default app;
