import Hapi from '@hapi/hapi';
import { environment } from './config/environment';
import { configureRoutes } from './application/routes';
import { errorHandler } from './application/middleware/error.middleware';
import { sequelize } from './config/database/mysql';
import { log } from './config/logger';
import { Server, Request, ResponseToolkit } from '@hapi/hapi';
import { getRedisClient } from './config/database/redis';

const logger = log.withContext('Server');

const waitForServices = async () => {
    let retries = 5;
    while (retries > 0) {
        try {
            await getRedisClient().ping();
            await sequelize.authenticate();
            // Verificar que la conexión está lista
            await sequelize.connectionManager.getConnection({ type: 'read' });
            break;
        } catch (error) {
            retries--;
            if (retries === 0) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

export const initializeServer = async (): Promise<Server> => {
    await waitForServices();
    const server = Hapi.server({
        port: environment.port,
        host: '0.0.0.0',
        routes: {
            cors: true
        }
    });

    // Manejo global de errores
    server.ext({
        type: 'onPreResponse',
        method: (request: Request, h: ResponseToolkit) => {
            const response = request.response;
            if (response instanceof Error) {
                return errorHandler(request, h);
            }
            return h.continue;
        }
    });

    // Registrar rutas
    await configureRoutes(server);

    return server;
}; 