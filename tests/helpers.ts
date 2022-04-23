import { Server } from "restify";
import { config } from "../config";
import { logger } from "../src/common/logger";
import { createServer } from "../src/server";

export const endpoint = (server: Server, path: string): string => {
    return `http://localhost:${server!.address().port}${config.http.prefix}${path}`;
}

export class TestHelper {

    server: Server;

    constructor() {
        this.server = createServer();
    }

    addRoutes(prefix: string, method: (prefix: string, server: Server) => void) {
        method(prefix, this.server);
    }

    startServer(done: () => void) {
        this.server.listen(config.http.port, config.http.host, () => {
            const { port, family, address } = this.server.address();
            logger.info('ready at %s:%d (%s)', address, port, family);
            done();
        });
    }

    stopServer(done: () => void) {
        this.server.close(done);
    }

    endpoint = (prefix: string, path: string): string => {
        return `http://localhost:${this.server.address().port}${prefix}${path}`;
    }

}