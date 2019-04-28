import * as sinon from 'sinon';
import 'chai/register-should';
import App from '../src/libs/service/service';
import mailSender from '../src/libs/mailer/mailer';
import request from 'supertest-promised';
import ActionRepository from '../src/models/action/action';
import UserRepository from '../src/models/user/user';

const configuration = {
    DB: {
        type: 'mongo',
        url: 'mongodb://test_user:FSeKBJ7fAvmLWm7@ds149146.mlab.com:49146/ioc-boilerplate-test'
    },
    SERVER: {
        port: 3000,
        baseUrl: '/api/v1',
        uiUrl: 'http://127.0.0.1'
    },
    LOGGER: {
        path: '/logs',
        fileName: 'delivery-be-test.log'
    },
    AUTH: {
        secret: '43BF1F678DD0345D12376230D1BF9B12',
        expiresIn: '10d',
        saltRounds: 3
    },
    MAIL: {
        from: 'user@gmail.com',
        transport_options: {
            host: 'smpt.gmail.com',
            service: 'Gmail',
            auth: {
                user: 'user@gmail.com',
                pass: 'password'
            }
        }
    }
};
const app = new App(configuration);
let server;
let sandbox;

describe('UserService', () => {
    before(async () => {
        await app.start();
        server = app.server;
        sandbox = sinon.createSandbox();
    });

    after(async () => {
        await app.stop();
    });

    afterEach(() => {
        sandbox.restore();
    });

    beforeEach(async () => {
        await app.clearDb();
        sandbox.restore();
    });

    describe('RegisterUser', () => {
        it.only('Should return 200 if registered new user', async () => {
            const emailStub = sandbox.stub(mailSender, 'send').returns(Promise.resolve());

            await request(server)
                .put('/api/v1/user')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@email.com', name: 'userName' })
                .expect(200)
                .end();

            sinon.assert.calledWith(emailStub, 'some@email.com', 'REGISTER', {
                actionId: sinon.match.string,
                name: 'userName',
                uiUrl: 'http://localhost'
            });
        });

        it('Should return 400 if user with provided email alredy exists', async () => {
            const emailStub = sandbox.stub(mailSender, 'send').returns(Promise.resolve());

            await new User({ email: 'existing@mail.com', name: 'Petro' }).save();

            const response = await request(server)
                .post('/api/v1/user/register')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'existing@mail.com', name: 'Alexander' })
                .expect(400)
                .end()
                .get('body');

            response.should.eql({
                error: 'ValidationError',
                message: "User with email of 'existing@mail.com' already exists"
            });
            emailStub.notCalled.should.be.true();
        });

        it('Should return 400 if user with provided name alredy exists', async () => {
            const emailStub = sandbox.stub(mailSender, 'send').returns(Promise.resolve());

            await new User({ email: 'existing@mail.com', name: 'Petro' }).save();

            const response = await request(server)
                .post('/api/v1/user/register')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'another@mail.com', name: 'Petro' })
                .expect(400)
                .end()
                .get('body');

            response.should.eql({
                error: 'ValidationError',
                message: "User with name of 'Petro' already exists"
            });
            emailStub.notCalled.should.be.true();
        });
    });

    describe('ActivateUser', () => {
        it('Should return 200 if user activated', async () => {
            const user = await new User({ email: 'some@mail.com', name: 'Dmytry' }).save();
            const action = await Action.create({ userId: user.id, type: 'REGISTER' });

            await request(server)
                .put(`/api/v1/actions/${action.id}`)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ password: 'SomePassword123' })
                .expect(200)
                .end();
        });

        it('should return 404 if action not exists', async () => {
            await request(server)
                .put('/api/v1/actions/aaaaaaaaaaaaaaaaaaaaaaaa')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ password: 'SomePassword123' })
                .expect(404)
                .end();
        });
    });
});
