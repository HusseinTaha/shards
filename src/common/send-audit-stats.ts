// A restify server.on('after', ...) handler
//
// Will send requests statistics to a statsd server
import { Request, Response, Next as NextFunction } from 'restify';
import { createClient } from './statsd-wrapper';

const stats = createClient(undefined);

const cleanupStatsKey = (key: string) => key.replace(/[-.]/g, '_').toLowerCase();

// TODO: remove this after upgrading restify
interface RequestWithPrivate extends Request {
    _body: { restCode: string; }
    timers: { name: string, time: any[] }[]
}

export const sendAuditStats = (req: RequestWithPrivate, res: Response, next: NextFunction) => {


    // send number of calls to this route (with response status code) with 10% sampling
    const routeName = req.getRoute() ? 'route.' + req.getRoute().name : 'invalid_route';
    stats.increment(routeName + '.status.' + res.statusCode, 1, 0.1);


    // send error statuses (with response status code) with 10% sampling
    if (req._body && req._body.restCode) {
        stats.increment(routeName + '.code.' + cleanupStatsKey(req._body.restCode), 1, 0.1);
    }

    // send timings with 1% sampling
    (req.timers || []).forEach((timer) => {
        const t = timer.time;
        const n = cleanupStatsKey(timer.name);
        stats.timing(routeName + '.timers.' + n, 1000000000 * t[0] + t[1], 0.01);
    });


    if (typeof next == 'function') {
        next();
    }
};