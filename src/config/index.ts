import dotenv from 'dotenv';

const envFile: string = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

interface AppConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string | undefined;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
} as const;
