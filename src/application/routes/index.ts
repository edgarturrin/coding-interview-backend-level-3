import {Server} from '@hapi/hapi';
import { registerHealthRoutes } from './health.routes';
import { registerApiRoutes } from './api.routes';

export const configureRoutes = (server: Server) => {
  registerApiRoutes(server);
  registerHealthRoutes(server);
}; 