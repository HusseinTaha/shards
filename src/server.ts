import { Request, Response, Server, ServerOptions, Next as NextFunction } from 'restify';
import restify from 'restify';
import { logger } from './common/logger';
import { config } from '../config';
import { sendAuditStats } from './common/send-audit-stats';
import { setupShards } from './shards';

const shouldLogRequest = (req: Request) =>
    req.url?.indexOf(`${config.http.prefix}/ping/_health_check`) !== 0;

const shouldLogResponse = (res: Response) =>
    (res && res.statusCode >= 500);

const filteredLogger = (errorsOnly: boolean, logger: any) => (req: Request, res: Response, next: NextFunction) => {
    const logError = errorsOnly && shouldLogResponse(res);
    const logInfo = !errorsOnly && (
        shouldLogRequest(req) || shouldLogResponse(res));
    if (logError || logInfo)
        logger(req, res);
    if (next && typeof next === 'function')
        next();
};

export const createServer = () => {
    logger.info({ env: process.env }, 'environment');
    const server: Server = restify.createServer({
        handleUncaughtExceptions: true,
        log: logger
    } as ServerOptions);

    const requestLogger = filteredLogger(false, (req: Request) =>
        req.log.info({ req_id: req.id() }, `${req.method} ${req.url}`));
    server.use(requestLogger);

    server.use(restify.plugins.queryParser());
    server.use(restify.plugins.bodyParser());

    // Audit requests
    server.on('after', filteredLogger(process.env.NODE_ENV === 'production',
        restify.plugins.auditLogger({ log: logger, event: 'after'/*, body: true*/ })));

    // Automatically add a request-id to the response
    function setRequestId(req: Request, res: Response, next: NextFunction) {
        req.log = req.log.child({ req_id: req.id() });
        res.setHeader('X-Request-Id', req.id());
        return next();
    }
    server.use(setRequestId);

    // Send audit statistics
    server.on('after', sendAuditStats);

    // Init object to dump our stuff into.
    server.use(setupShards(config.shardRules));

    return server;
};