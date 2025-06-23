import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import config from './config/index';
import routes from './routes/index';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import morganMiddleware from './middleware/morgan.middleware';

const app: Application = express();

// Security and core middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser for handling HttpOnly cookies (refresh tokens)
app.use(cookieParser());

// Performance middleware
app.use(compression());

// Logging
app.use(morganMiddleware);

// API routes
app.use(config.apiPrefix, routes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
