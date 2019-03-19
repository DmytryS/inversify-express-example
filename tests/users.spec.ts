import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import * as request from 'supertest-promised';
import App from '../src/libs/service/service';

const app = new App();
let sandbox;
let server;

describe('Hello function', () => {
    before(async () => {
        await app.start();
        server = app.server;
        sandbox = sinon.createSandbox();
    });

    after(async () => {
        await app.stop();
    });

    beforeEach(async () => {
        await app.clearDb();
        sandbox.restore();
    });


    describe('Register', () => {
        it('should return hello world', async () => {
            const result = await request(server)
                .post('/api/v1/user/register')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@email.com', name: 'userName' })
                .expect(200)
                .end();
            expect(result).to.equal('Hello world!');
        });
    });


});