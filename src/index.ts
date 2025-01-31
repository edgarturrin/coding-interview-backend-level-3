import { environment } from './config';
import { initializeServer } from './server';
import { mysqlConnect } from './config/database/mysql';
import { redisConnect } from './config/database/redis';
import { log } from './config/logger';

const logger = log.withContext('App');

const bootstrap = async () => {
    try {
        await mysqlConnect();
        await redisConnect();
        
        const server = await initializeServer();
        await server.start();

        logger.info(`Server running on ${server.info.uri}`);

        process.on('SIGTERM', async () => {
            logger.info('SIGTERM received. Starting graceful shutdown...');
            await server.stop();
            process.exit(0);
        });
        
    } catch (error) {
        logger.error('Failed to bootstrap application:', error);
        process.exit(1);
    }
};

bootstrap();