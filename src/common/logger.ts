import bunyan from 'bunyan';
import { config } from '../../config';

export const logger = bunyan.createLogger({
    level: config.logLevel,
    name: config.name
});