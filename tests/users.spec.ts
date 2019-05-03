import 'mocha';
import 'chai/register-should';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import * as request from 'supertest-promised';
import App from '../src/libs/service/service';
import IMailerService from '../src/libs/mailer/interface';
import IUserRepository from '../src/models/user/interface';
import { container } from '../src/libs/ioc/ioc';
import TYPES from '../src/constant/types';

chai.use(sinonChai);

const app = new App();
let sandbox;
let server;
let userRepository;
let authService;

describe('User service', () => {
    before(async () => {
        await app.start();
        server = app.server;

        sandbox = sinon.createSandbox();
        userRepository = container.get<IUserRepository>(TYPES.UserRepository);
        authService = container.get(TYPES.AuthService);
    });

    after(async () => {
        await app.stop();
    });

    afterEach(() => {
        // sandbox.restore();
        container.restore();
    });

    beforeEach(async () => {
        await app.clearDb();
        container.snapshot();
        sandbox.restore();
    });

    describe('Register', () => {
        it('should return user id if succesfully registered new user', async () => {
            const mailerStub = sandbox
                .stub(container.get<IMailerService>(TYPES.MailerService), 'send')
                .returns(Promise.resolve());

            const response = await request(server)
                .put('/api/v1/users')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@email.com', name: 'userName' })
                .expect(200)
                .end()
                .get('body');

            sinon.assert.match(response, { _id: sinon.match.string });

            mailerStub.should.have.been.calledOnce;

            mailerStub.should.be.calledWith('some@email.com', 'REGISTER', {
                actionId: sinon.match.string,
                uiUrl: 'http://localhost'
            });
        });

        it('should return user id and resend activation key if user status is PENDING', async () => {
            const mailerStub = sandbox
                .stub(container.get<IMailerService>(TYPES.MailerService), 'send')
                .returns(Promise.resolve());

            const existingUser = await userRepository
                .User({
                    email: 'some@email.com',
                    name: 'Dummy_1',
                    role: 'USER',
                    status: 'PENDING'
                })
                .save();

            const response = await request(server)
                .put('/api/v1/users')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@email.com', name: 'userName' })
                .expect(200)
                .end()
                .get('body');

            sinon.assert.match(response, { _id: existingUser._id.toString() });
            mailerStub.should.have.been.calledOnce;
            mailerStub.should.be.calledWith('some@email.com', 'REGISTER', {
                actionId: sinon.match.string,
                uiUrl: 'http://localhost'
            });
        });

        it('should return 409 error if user with such email already exists', async () => {
            const mailerStub = sandbox
                .stub(container.get<IMailerService>(TYPES.MailerService), 'send')
                .returns(Promise.resolve());

            await userRepository
                .User({
                    email: 'some@email.com',
                    name: 'Dummy_2',
                    role: 'USER',
                    status: 'ACTIVE'
                })
                .save();

            await request(server)
                .put('/api/v1/users')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@email.com', name: 'userName' })
                .expect(409)
                .end()
                .get('body');

            mailerStub.should.not.have.been.called;
        });

        it('should return 405 error if trying to register ADMIN user', async () => {
            const mailerStub = sandbox
                .stub(container.get<IMailerService>(TYPES.MailerService), 'send')
                .returns(Promise.resolve());

            await request(server)
                .put('/api/v1/users')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@email.com', name: 'userName', role: 'ADMIN' })
                .expect(405)
                .end()
                .get('body');

            mailerStub.should.not.have.been.called;
        });

        it.skip('should return admin if registered by admin', async () => {
            const mailerStub = sandbox
                .stub(container.get<IMailerService>(TYPES.MailerService), 'send')
                .returns(Promise.resolve());

            const user = await userRepository
                .User({
                    email: 'some@email.com',
                    name: 'Dummy_2',
                    role: 'ADMIN',
                    status: 'ACTIVE'
                })
                .save();

            await user.setPassword('SOME_PASS');

            const { token } = await authService.authenticateCredentials({
                body: {
                    email: 'some@email.com',
                    password: 'SOME_PASS'
                }
            });

            const response = await request(server)
                .put('/api/v1/users')
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .send({ email: 'another_one@email.com', name: 'userName', role: 'ADMIN' })
                .expect(200)
                .end()
                .get('body');

            sinon.assert.match(response, { _id: sinon.match.string });
            mailerStub.should.have.been.calledOnce;
            mailerStub.should.be.calledWith('some@email.com', 'REGISTER', {
                actionId: sinon.match.string,
                uiUrl: 'http://localhost'
            });
        });

        it('should return 405 error if trying to register admin by user', async () => {
            const mailerStub = sandbox
                .stub(container.get<IMailerService>(TYPES.MailerService), 'send')
                .returns(Promise.resolve());

            const user = await userRepository
                .User({
                    email: 'some@email.com',
                    name: 'Dummy_2',
                    roel: 'USER',
                    status: 'ACTIVE'
                })
                .save();

            await user.setPassword('SOME_PASS');

            const { token } = await authService.authenticateCredentials({
                body: {
                    email: 'some@email.com',
                    password: 'SOME_PASS'
                }
            });

            await request(server)
                .put('/api/v1/users')
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .send({
                    email: 'some@email.com',
                    name: 'userName',
                    role: 'ADMIN'
                })
                .expect(405)
                .end()
                .get('body');

            mailerStub.should.not.have.been.called;
        });
    });
});
