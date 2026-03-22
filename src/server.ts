import 'reflect-metadata';
import app from './app';
import { AppDataSource } from './config/database';
import { envConfig } from './config/env';

/**
 * Punto de entrada de la aplicación.
 * Inicializa la conexión a la base de datos antes de levantar el servidor HTTP.
 */
async function bootstrap(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established.');

    app.listen(envConfig.port, () => {
      console.log(`Server running on port ${envConfig.port} [${envConfig.nodeEnv}]`);
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
