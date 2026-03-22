import dotenv from 'dotenv';

dotenv.config();

/**
 * Singleton que centraliza el acceso a las variables de entorno.
 * Se instancia una sola vez y se reutiliza en toda la aplicación.
 */
class EnvConfig {
  private static instance: EnvConfig;

  readonly port: number;
  readonly nodeEnv: string;

  readonly dbHost: string;
  readonly dbPort: number;
  readonly dbUser: string;
  readonly dbPassword: string;
  readonly dbName: string;

  readonly jwtSecret: string;
  readonly jwtExpiresIn: string;

  private constructor() {
    this.port = Number(process.env.PORT) || 3000;
    this.nodeEnv = process.env.NODE_ENV || 'development';

    this.dbHost = process.env.DB_HOST || 'localhost';
    this.dbPort = Number(process.env.DB_PORT) || 5432;
    this.dbUser = process.env.DB_USER || '';
    this.dbPassword = process.env.DB_PASSWORD || '';
    this.dbName = process.env.DB_NAME || '';

    this.jwtSecret = process.env.JWT_SECRET || '';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
  }

  /**
   * Retorna la única instancia de EnvConfig.
   * Si no existe, la crea.
   */
  static getInstance(): EnvConfig {
    if (!EnvConfig.instance) {
      EnvConfig.instance = new EnvConfig();
    }
    return EnvConfig.instance;
  }
}

export const envConfig = EnvConfig.getInstance();
