import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { envConfig } from './env';

/**
 * DataSource centralizada para la conexión con PostgreSQL via TypeORM.
 * Se inicializa en server.ts al arrancar la aplicación.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: envConfig.dbHost,
  port: envConfig.dbPort,
  username: envConfig.dbUser,
  password: envConfig.dbPassword,
  database: envConfig.dbName,
  synchronize: envConfig.nodeEnv === 'development',
  logging: envConfig.nodeEnv === 'development',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/persistence/migrations/*.ts'],
});
