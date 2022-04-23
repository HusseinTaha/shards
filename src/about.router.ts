import os from 'os';
import pk from '../package.json';
import { Request, Response, Server, Next } from 'restify';

const aboutJson: string = JSON.stringify({
    hostname: os.hostname(),
    type: pk.name,
    version: pk.version,
    description: pk.description,
    startDate: new Date().toISOString()
});

const sendAbout = (req: Request, res: Response, next: Next) => {
    res.header('Content-Type', 'application/json; charset=UTF-8');
    res.end(aboutJson);
    next();
};

export const createAbout = (prefix: string, server: Server) => {
    server.get('/about', sendAbout);
    server.get(`${prefix}/about`, sendAbout);
};
79884914044