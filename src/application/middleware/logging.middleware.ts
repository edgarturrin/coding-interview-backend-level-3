import { Request, Response, NextFunction } from 'express';
import { log } from '../../config/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        log.info(`${req.method} ${req.url}`, {
            duration,
            status: res.statusCode,
            ip: req.ip
        });
    });

    next();
}; 