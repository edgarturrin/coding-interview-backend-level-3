import winston from 'winston';
import { environment } from './environment';

const { combine, timestamp, printf, colorize } = winston.format;

// Formato personalizado para los logs
const logFormat = printf(({ level, message, timestamp, context, ...metadata }) => {
    let msg = `${timestamp} [${level}]`;
    
    if (context) {
        msg += ` [${context}]`;
    }
    
    msg += `: ${message}`;
    
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    
    return msg;
});

// Configuración del logger
export const logger = winston.createLogger({
    level: environment.isProduction ? 'info' : 'debug',
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        // Logs de error a archivo
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            format: combine(timestamp(), logFormat)
        }),
        // Todos los logs a archivo
        new winston.transports.File({ 
            filename: 'logs/combined.log',
            format: combine(timestamp(), logFormat)
        })
    ]
});

// Si no estamos en producción, también log a consola
if (environment.nodeEnv !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            timestamp(),
            logFormat
        )
    }));
}

// Wrapper para métodos comunes
export const log = {
    info: (message: string, meta?: any) => logger.info(message, meta),
    error: (message: string, error?: any) => logger.error(message, { error }),
    warn: (message: string, meta?: any) => logger.warn(message, meta),
    debug: (message: string, meta?: any) => logger.debug(message, meta),
    withContext: (context: string) => ({
        info: (message: string, meta?: any) => 
            logger.info(message, { ...meta, context }),
        error: (message: string, error?: any) => 
            logger.error(message, { error, context }),
        warn: (message: string, meta?: any) => 
            logger.warn(message, { ...meta, context }),
        debug: (message: string, meta?: any) => 
            logger.debug(message, { ...meta, context })
    })
};