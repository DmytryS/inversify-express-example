import 'mocha';
import 'chai/register-should';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import * as request from 'supertest-promised';
import App from '../src/libs/service/service';
import IMailer from '../src/libs/mailer/interface';
import { container } from '../src/libs/ioc/ioc';
import TYPES from '../src/constant/types';

chai.use(sinonChai);

const app = new App();
let sandbox;
let server;

describe('User service', () => {
    before(async () => {
        await app.start();
        server = app.server;

        sandbox = sinon.createSandbox();
    });

    after(async () => {
        await app.stop();
    });

    afterEach(() => {
        container.restore();
    });

    beforeEach(async () => {
        await app.clearDb();
        sandbox.restore();
        container.snapshot();
    });

    describe('Register', () => {
        it('should return user id if succesfully registered new user (default TYPE)', async () => {
            const mailerStub = sinon
                .stub(container.get<IMailer>(TYPES.MailerService), 'send')
                .returns(Promise.resolve());

            const response = await request(server)
                .put('/api/v1/users')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@email.com', name: 'userName' })
                .expect(200)
                .end()
                .get('body');

            response.should.have.property('_id').be.a.string;

            mailerStub.should.have.been.calledOnce;

            mailerStub.should.be.calledWith('some@email.com', 'REGISTER', {
                actionId: sinon.match.string,
                uiUrl: 'http://localhost'
            });
        });
    });
});
