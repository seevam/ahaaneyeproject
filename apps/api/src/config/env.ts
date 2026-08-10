import dotenv from 'dotenv';
import path from 'path';

// Load apps/api/.env (two levels up from src/config/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production');
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.API_PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://eyecare:eyecare@localhost:5433/eyecare',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: '90d',
} as const;
