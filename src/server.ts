// src/server.ts
import * as dotenv from 'dotenv';
import { createServer } from 'http';
import winston from 'winston';
import app from './app';
import { isMongoDBConnected, isRedisConnected, connectMongoDB, connectRedis, disconnectMongoDB, disconnectRedis } from './database';

dotenv.config();

// Initialize logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

const PORT: number = parseInt(process.env.PORT || '5000', 10);
const HOST: string = process.env.HOST || '0.0.0.0';
const server = createServer(app);

// Health check endpoint
app.get('/health', (_req, res) => {
  const healthStatus = {
    status: 'success',
    mongodb: isMongoDBConnected(),
    redis: isRedisConnected(),
    uptime: process.uptime(),
  };
  res.status(200).json(healthStatus);
});

const startServer = async () => {
  try {
    // Connect to databases
    await connectMongoDB();
    await connectRedis();

    server.listen(PORT, HOST, () => {
      logger.info(`Server is running on http://${HOST}:${PORT}`);
      logger.info('Press Ctrl+C to stop the server');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async (err) => {
    if (err) {
      logger.error('Error closing server:', err);
      process.exit(1);
    }
    try {
      await disconnectMongoDB();
      await disconnectRedis();
      logger.info('Server and database connections closed. Exiting process...');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Shutdown timed out. Forcing exit...');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown('Uncaught Exception');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally decide to shutdown based on severity
});

// Start the server
startServer();