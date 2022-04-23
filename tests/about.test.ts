
import { createAbout } from '../src/about.router';
import { config } from "../config";
import superagent from "superagent";
import { expect } from "chai";
import { TestHelper } from "./helpers";


describe('about', () => {
    const test: TestHelper = new TestHelper();

    beforeEach((done) => {
        test.addRoutes(config.http.prefix, createAbout);
        test.startServer(done);
    });

    afterEach((done) => {
        test.stopServer(done);
    });

    it('respond with about', (done) => {
        superagent
            .get(test.endpoint(config.http.prefix, '/about'))
            .end((err, res) => {
                expect(err, 'request error').to.be.null;
                expect(res?.status, 'response status').to.equal(200);
                done();
            });
    });
});