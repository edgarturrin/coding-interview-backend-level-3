import { Server, Request, ResponseToolkit } from '@hapi/hapi';
import { getRedisClient } from '../../config/database/redis';

export class HealthController {
    public registerRoutes(server: Server): void {
        server.route([
            {
                method: 'GET',
                path: '/ping',
                handler: this.check.bind(this)
            }
        ]);
    }

    private async check(request: Request, h: ResponseToolkit) {
        try {
            await getRedisClient().ping();
            return h.response({ ok: true }).code(200);
        } catch (error) {
            return h.response({ 
                status: 'unhealthy', 
                error: error instanceof Error ? error.message : 'Unknown error' 
            }).code(500);
        }
    }
} 