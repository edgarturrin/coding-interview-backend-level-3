import { Sequelize } from 'sequelize';
import { environment } from '../environment';
import { log } from '../logger';

const logger = log.withContext('MySQL');

export const sequelize = new Sequelize({
    dialect: 'mysql',
    host: environment.mysqlHost,
    username: environment.mysqlUser,
    password: environment.mysqlPassword,
    database: environment.mysqlDatabase,
    logging: (msg) => logger.debug(msg)
});

export const mysqlConnect = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        logger.info('Connected to MySQL');
    } catch (error) {
        logger.error('Error connecting to MySQL:', error);
        throw error;
    }
}; 