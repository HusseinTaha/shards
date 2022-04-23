import { logger } from './logger';
import { StatsD } from 'node-statsd';
import Logger from 'bunyan';

export const dummyClient = () => {
    return {
        increment: () => undefined,
        timing: () => undefined,
        decrement: () => undefined,
        histogram: () => undefined,
        gauge: () => undefined,
        set: () => undefined,
        unique: () => undefined,
    };
};

const requiredEnv = ['STATSD_HOST', 'STATSD_PORT', 'STATSD_PREFIX'];

const missingEnv = () => requiredEnv.filter((e) => !process.env[e])[0];

export const createClient = function (logArg: Logger | undefined) {
    const log = logArg || logger.child({
        module: 'statsd'
    });
    if (missingEnv()) {
        log.warn("Can't initialize statsd, missing env: " + missingEnv());
        return dummyClient();
    }
    const client = new StatsD({
        host: process.env.STATSD_HOST as string,
        port: parseInt(process.env.STATSD_PORT!),
        prefix: process.env.STATSD_PREFIX as string
    });
    client.socket.on('error', function (error) {
        return log.error('error in socket', error);
    });
    return client;
};