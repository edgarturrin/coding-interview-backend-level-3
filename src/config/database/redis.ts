import Redis from 'ioredis';
import { environment } from '../environment';
import { log } from '../logger';

let redisClient: Redis | null = null;

export class RedisError extends Error {
    constructor(message: string, public readonly cause?: unknown) {
        super(message);
        this.name = 'RedisError';
    }
}

interface RedisConfig {
    retryAttempts?: number;
    retryDelay?: number;
    onError?: (error: Error) => void;
}

export const getRedisClient = (config: RedisConfig = {}): Redis => {
    if (!redisClient) {
        try {
            redisClient = new Redis(environment.redisUri, {
                retryStrategy: (times) => {
                    if (times > (config.retryAttempts || 3)) return null;
                    return config.retryDelay || 1000;
                },
                maxRetriesPerRequest: 3,
                enableReadyCheck: true,

            });
           
            redisClient.on('error', (error: any) => {
                log.error('Redis client error', error);
                config.onError?.(error);
            });

            log.info('Redis client created');
        } catch (error) {
            log.error('Failed to create Redis client', error);
            throw new RedisError('Failed to create Redis client', error instanceof Error ? error : new Error(String(error)));
        }
    }
    return redisClient;
};

export const redisConnect = async (): Promise<void> => {
    try {
        const client = getRedisClient();
        await client.ping();
        log.info('Successfully connected to Redis');
    } catch (error) {
        log.error('Error connecting to Redis', error);
        throw error;
    }
};

export const closeRedisConnection = async (): Promise<void> => {
    if (redisClient) {
        try {
            await redisClient.quit();
            redisClient = null;
            log.info('Redis connection closed');
        } catch (error) {
            log.error('Error closing Redis connection', error);
            throw error;
        }
    }
}; 