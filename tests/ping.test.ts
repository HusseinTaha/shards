
import { config } from "../config";
import superagent from "superagent";
import { expect } from "chai";
import { TestHelper } from "./helpers";
import { createPingRouter } from '../src/ping.router';

describe('ping', () => {
    const test: TestHelper = new TestHelper();

    beforeEach((done) => {
        test.addRoutes(config.http.prefix, createPingRouter);
        test.startServer(done);
    });

    afterEach((done) => {
        test.stopServer(done);
    });

    it('respond with pong', (done) => {
        superagent
            .get(test.endpoint(config.http.prefix, '/ping/test'))
            .end((err, res) => {
                expect(err, 'request error').to.be.null;
                expect(res?.status, 'response status').to.equal(200);
                expect(res?.body, 'response body').to.equal('pong/test');
                done();
            });
    });
});