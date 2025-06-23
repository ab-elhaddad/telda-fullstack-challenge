import morgan from 'morgan';
import logger from '@config/logger';
import config from '@config/index';

const stream = {
  // Use the logger for writing logs instead of console
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Define skip function to prevent logging in test environment
const skip = () => {
  const env = config.nodeEnv;
  return env === 'test';
};

// Create a Morgan middleware with appropriate format
const morganMiddleware = morgan(
  // Use dev format for development and combined for production
  config.logFormat === 'dev' ? 'dev' : 'combined',
  { stream, skip }
);

export default morganMiddleware;
