import { getRedisClient } from '../config/database/redis';

/**
 * Obtiene un valor del caché
 */
const get = async (key: string) => {
    const value = await getRedisClient().get(key);
    return value ? JSON.parse(value) : null;
};

/**
 * Guarda un valor en el caché
 */
const save = async (key: string, data: any) => {
    await getRedisClient().set(key, JSON.stringify(data));
};

interface CacheOptions {
    ttl?: number;  // Tiempo en segundos
    key: string;
}

/**
 * Decorator que permite cachear el resultado de un método usando Redis.
 * @param options - Opciones para el caché o clave directamente
 */
export function Cacheable(options: CacheOptions | string) {
    const { key, ttl } = typeof options === 'string' ? { key: options, ttl: undefined } : options;
    
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            let response = await get(key);

            if (!response) {
                response = await originalMethod.apply(this, args);
                if (ttl) {
                    await getRedisClient().set(key, JSON.stringify(response), 'EX', ttl);
                } else {
                    await save(key, response);
                }
            }

            return response;
        };
        return descriptor;
    };
}

/**
 * Decorator que limpia una clave específica del caché
 */
export function ClearCache(cacheKey: string) {
    
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            
            await getRedisClient().del(cacheKey);
            return await originalMethod.apply(this, args);
            

        };
        return descriptor;
    };
}
