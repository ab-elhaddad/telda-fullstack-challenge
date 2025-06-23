import http from 'http';
import config from './config';
import logger from './config/logger';
import setupDatabase from './utils/setupDatabase';
import app from './app';

// Normalize port
const normalizePort = (val: string): number => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return 5000; // Default port
  }

  if (port >= 0) {
    return port;
  }

  return 5000;
};

const port = normalizePort(config.port);
app.set('port', port);

// Create HTTP server
const server = http.createServer(app);

// Handle errors
function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Server start listening
async function onListening(): Promise<void> {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + (addr?.port || 'unknown');

  try {
    // Setup database tables
    await setupDatabase();
    logger.info(`Server listening on ${bind}`);
  } catch (error) {
    logger.error('Failed to start server properly:', error);
    process.exit(1);
  }
}

// Listen on provided port
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// Handle graceful shutdown
const gracefulShutdown = (): void => {
  logger.info('Server is shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force shutdown if graceful shutdown fails
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default server;
