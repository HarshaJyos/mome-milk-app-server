// src/database.ts
import mongoose from 'mongoose';
import Redis from 'ioredis';
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

let redisClient: Redis | null = null;

// MongoDB connection
const connectMongoDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/pandu';
  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  let retries = 5;
  while (retries > 0) {
    try {
      await mongoose.connect(mongoURI, options);
      logger.info('MongoDB connected successfully');
      return;
    } catch (error) {
      retries -= 1;
      logger.error(`MongoDB connection failed. Retries left: ${retries}`, error);
      if (retries === 0) {
        throw new Error('Failed to connect to MongoDB after retries');
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

const disconnectMongoDB = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};

const isMongoDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Redis connection
const connectRedis = async () => {
  const redisURI = process.env.REDIS_URI || 'redis://localhost:6379';
  redisClient = new Redis(redisURI, {
    maxRetriesPerRequest: 5,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  redisClient.on('error', (error) => {
    logger.error('Redis connection error:', error);
  });

  return new Promise((resolve, reject) => {
    redisClient!.on('ready', resolve);
    redisClient!.on('error', reject);
  });
};

const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis disconnected');
    redisClient = null;
  }
};

const isRedisConnected = () => {
  return redisClient?.status === 'ready' || false;
};

export {
  connectMongoDB,
  disconnectMongoDB,
  isMongoDBConnected,
  connectRedis,
  disconnectRedis,
  isRedisConnected,
  redisClient,
};