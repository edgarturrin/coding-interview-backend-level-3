import { defaultConfig } from './default';
import { Environment } from './types';

const getEnvironment = (): Environment => {
  return {
    port: Number(process.env.PORT) || defaultConfig.port,
    mongoUri: process.env.MONGODB_URI || defaultConfig.mongoUri,
    env: process.env.APP_ENV || defaultConfig.env
  };
};

export const environment = getEnvironment(); 