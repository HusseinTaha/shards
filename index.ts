
import async from 'async';
import cluster from 'cluster';
import restify, { Server } from 'restify';
import { InternalError } from 'restify-errors';
import curtain from 'curtain-down';
import { config } from './config';
import { createAbout } from './src/about.router';
import { createPingRouter } from './src/ping.router';
import { createServer } from './src/server';
import { logger } from './src/common/logger';

const master = () => {
    let running = true;

    curtain.on(() => {
        if (!running) {
            logger.info('aaaaaarghhhhh...');
            return process.exit(1);
        }

        logger.info('master stopping…');
        running = false;

        // Forcefully exit if workers hang for too long
        setTimeout(process.exit.bind(process, 0), 30e3).unref();
    });

    logger.info(config, 'parsed config');

    cluster.fork();

    cluster.on('disconnect', (worker) => {
        logger.info('worker disconnected');

        if (running) {
            logger.error('restarting…');
            cluster.fork();
        }
    });
};

const child = () => {
    const server: Server = createServer();

    createAbout(config.http.prefix, server);
    createPingRouter(config.http.prefix, server);

    curtain.on(() => {
        logger.info('worker stopping…');

        server.close(() => {
            cluster.worker?.disconnect()
        });
    });

    server.listen(config.http.port, config.http.host, () => {
        const { port, family, address } = server.address();
        logger.info('ready at %s:%d (%s)', address, port, family);
    });

    // Handle uncaughtException, kill the worker.
    server.on('uncaughtException', (req, res, route, err) => {
        logger.error(err);

        // Note: we're in dangerous territory!
        // By definition, something unexpected occurred,
        // which we probably didn't want.
        // Anything can happen now! Be very careful!
        try {
            // make sure we close down within 30 seconds
            setTimeout(() => process.exit(1), 30e3);

            // stop taking new requests
            server.close();

            // Let the master know we're dead.  This will trigger a
            // 'disconnect' in the cluster master, and then it will fork
            // a new worker.
            cluster.worker?.disconnect();

            const message = err.message || 'unexpected error';
            res.send(new InternalError(message));
        }
        catch (err2) {
            logger.error(err2, 'error sending 500!');
        }
    });
};

module.exports = () => {
    return cluster.isMaster
        ? master()
        : child();
};