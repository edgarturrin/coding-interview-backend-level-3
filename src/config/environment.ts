type Environment = 'development' | 'production' | 'test';

function validateEnvironment(env: string): env is Environment {
    return ['development', 'production', 'test'].includes(env);
}

const nodeEnv = process.env.NODE_ENV || 'development';
if (!validateEnvironment(nodeEnv)) {
    throw new Error(`Invalid NODE_ENV: ${nodeEnv}`);
}

export const environment = {
    port: parseInt(process.env.PORT || '3535', 10),
    mysqlHost: process.env.MYSQL_HOST || 'localhost',
    mysqlUser: process.env.MYSQL_USER || 'root',
    mysqlPassword: process.env.MYSQL_PASSWORD || 'root',
    mysqlDatabase: process.env.MYSQL_DATABASE || 'dev',
    redisUri: process.env.REDIS_URI || 'redis://localhost:6379',
    nodeEnv: process.env.APP_ENV as Environment,
    isProduction: process.env.APP_ENV === 'production',
    isDevelopment: process.env.APP_ENV === 'development'
}; 
