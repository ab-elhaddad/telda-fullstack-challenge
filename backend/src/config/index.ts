import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface CloudStorageConfig {
  provider: string;
  baseUrl: string;
  region?: string;
  bucket?: string;
  apiKey?: string;
  apiSecret?: string;
}

interface Config {
  nodeEnv: string;
  port: string;
  apiPrefix: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  logLevel: string;
  logFormat: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  corsOrigin: string | RegExp | Array<string | RegExp>;
  cloudStorage?: CloudStorageConfig;
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || '5000',
  apiPrefix: process.env.API_PREFIX || '/api',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/movieapp',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_key_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_key_change_in_production',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  logLevel: process.env.LOG_LEVEL || 'info',
  logFormat: process.env.LOG_FORMAT || 'dev',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100, // 100 requests per windowMs
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Cloud Storage Configuration (placeholder for now)
  cloudStorage: process.env.CLOUD_STORAGE_PROVIDER ? {
    provider: process.env.CLOUD_STORAGE_PROVIDER || 'local', // 'aws' or 'cloudinary' or others
    baseUrl: process.env.CLOUD_STORAGE_BASE_URL || 'https://storage.example.com',
    region: process.env.CLOUD_STORAGE_REGION,
    bucket: process.env.CLOUD_STORAGE_BUCKET,
    apiKey: process.env.CLOUD_STORAGE_API_KEY,
    apiSecret: process.env.CLOUD_STORAGE_API_SECRET
  } : undefined,
};

export default config;
