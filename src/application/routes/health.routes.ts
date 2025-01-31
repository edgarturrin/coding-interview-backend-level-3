import { Server } from '@hapi/hapi';
import { HealthController } from '../controllers/health.controller';

const healthController = new HealthController();

export const registerHealthRoutes = (server: Server) => {
    healthController.registerRoutes(server);
}; 