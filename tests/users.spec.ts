import 'mocha';
import 'chai/register-should';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import * as request from 'supertest-promised';
import App from '../src/libs/service/service';
import { container } from '../src/libs/ioc/ioc';
import TYPES from '../src/constant/types';

chai.use(sinonChai);

let app;
let sandbox;
let server;
let userRepository;
let authService;

describe('User service', () => {
    before(async () => {
        app = new App();

        await app.start();
        server = app.server;

        sandbox = sinon.createSandbox();
        userRepository = container.get(TYPES.UserRepository);
        authService = container.get(TYPES.AuthService);
    });

    after(async () => {
        await app.stop();
    });

    beforeEach(async () => {
        await app.clearDb();
        sandbox.restore();
    });

    describe('Register', () => {
        it('should return user id if succesfully registered new user', async () => {
            const mailerStub = sandbox.stub(container.get(TYPES.MailerService), 'send').returns(Promise.resolve());

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
            const mailerStub = sandbox.stub(container.get(TYPES.MailerService), 'send').returns(Promise.resolve());

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

            response.should.eql({ _id: existingUser._id.toString() });
            mailerStub.should.have.been.calledOnce;
            mailerStub.should.be.calledWith('some@email.com', 'REGISTER', {
                actionId: sinon.match.string,
                uiUrl: 'http://localhost'
            });
        });

        it('should return 409 error if user with such email already exists', async () => {
            const mailerStub = sandbox.stub(container.get(TYPES.MailerService), 'send').returns(Promise.resolve());

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
            const mailerStub = sandbox.stub(container.get(TYPES.MailerService), 'send').returns(Promise.resolve());

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

        it('should return admin if registered by admin', async () => {
            const mailerStub = sandbox.stub(container.get(TYPES.MailerService), 'send').returns(Promise.resolve());

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
            mailerStub.should.be.calledWith('another_one@email.com', 'REGISTER', {
                actionId: sinon.match.string,
                uiUrl: 'http://localhost'
            });
        });

        it('should return 405 error if trying to register admin by user', async () => {
            const mailerStub = sandbox.stub(container.get(TYPES.MailerService), 'send').returns(Promise.resolve());

            const user = await userRepository
                .User({
                    email: 'some@email.com',
                    name: 'Dummy_2',
                    role: 'USER',
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

    describe('Login', () => {
        it('should return token if successfully logged in', async () => {
            const user = await userRepository
                .User({
                    email: 'some@email.com',
                    name: 'Dummy_2',
                    role: 'USER',
                    status: 'ACTIVE'
                })
                .save();

            await user.setPassword('SOME_PASS');

            const response = await request(server)
                .post('/api/v1/users/login')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@email.com', password: 'SOME_PASS' })
                .expect(200)
                .end()
                .get('body');

            sinon.assert.match(response, { token: sinon.match.string, expires: sinon.match.string });
        });

        it('should return 401 error if failed logged in', async () => {
            const user = await userRepository
                .User({
                    email: 'some@email.com',
                    name: 'Dummy_2',
                    role: 'USER',
                    status: 'ACTIVE'
                })
                .save();

            await user.setPassword('SOME_PASS');

            await request(server)
                .post('/api/v1/users/login')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@email.com', password: 'SOME_PASS_2' })
                .expect(401)
                .end()
                .get('body');
        });
    });

    describe('Reset password', () => {
        it('should send email for resetting password', async () => {
            const mailerStub = sandbox
                .stub(container.get(TYPES.MailerService), 'send')

                .returns(Promise.resolve());
            const user = await userRepository
                .User({
                    email: 'some@email.com',
                    name: 'Dummy_2',
                    role: 'USER',
                    status: 'ACTIVE'
                })
                .save();

            await user.setPassword('SOME_PASS');

            await request(server)
                .post('/api/v1/users/reset-password')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@email.com' })
                .expect(204)
                .end();

            mailerStub.should.have.been.calledOnce;
            mailerStub.should.be.calledWith('some@email.com', 'RESET_PASSWORD', {
                actionId: sinon.match.string,
                uiUrl: 'http://localhost'
            });
        });

        it('should return 404 error if user not exists', async () => {
            await request(server)
                .post('/api/v1/users/reset-password')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'not_existing@email.com' })
                .expect(404)
                .end();
        });

        it('should return error if user password not set', async () => {
            await userRepository
                .User({
                    email: 'some@email.com',
                    name: 'Dummy_2',
                    role: 'USER',
                    status: 'ACTIVE'
                })
                .save();

            await request(server)
                .post('/api/v1/users/reset-password')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@email.com' })
                .expect(405)
                .end()
                .get('body');
        });
    });

    describe('Profile', () => {
        it('should return user profile', async () => {
            const user = await userRepository
                .User({
                    email: 'some@email.com',
                    name: 'Dummy',
                    role: 'USER',
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
                .get('/api/v1/users/profile')
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .expect(200)
                .end()
                .get('body');

            response.should.eql({
                _id: user._id.toString(),
                email: 'some@email.com',
                name: 'Dummy',
                role: 'USER',
                status: 'ACTIVE'
            });
        });

        it('should return 401 error if unauthorized', async () => {
            await request(server)
                .get('/api/v1/users/profile')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect(401)
                .end()
                .get('body');
        });
    });

    describe('Get users', () => {
        it('Should return array of users', async () => {
            const user = await userRepository
                .User({
                    email: 'some_user@email.com',
                    name: 'Dummy_User',
                    role: 'USER',
                    status: 'ACTIVE'
                })
                .save();

            const admin = await userRepository
                .User({
                    email: 'some_admin@email.com',
                    name: 'Dummy_Admin',
                    role: 'ADMIN',
                    status: 'ACTIVE'
                })
                .save();

            await admin.setPassword('SOME_PASS');

            const { token } = await authService.authenticateCredentials({
                body: {
                    email: 'some_admin@email.com',
                    password: 'SOME_PASS'
                }
            });

            const response = await request(server)
                .get('/api/v1/users')
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .expect(200)
                .end()
                .get('body');

            response.should.eql([
                {
                    _id: user._id.toString(),
                    email: 'some_user@email.com',
                    name: 'Dummy_User',
                    role: 'USER',
                    status: 'ACTIVE'
                },
                {
                    _id: admin._id.toString(),
                    email: 'some_admin@email.com',
                    name: 'Dummy_Admin',
                    role: 'ADMIN',
                    status: 'ACTIVE'
                }
            ]);
        });

        it('Should return array of users with ADMIN role', async () => {
            const user = await userRepository
                .User({
                    email: 'some_user@email.com',
                    name: 'Dummy_User',
                    role: 'USER',
                    status: 'ACTIVE'
                })
                .save();

            const admin = await userRepository
                .User({
                    email: 'some_admin@email.com',
                    name: 'Dummy_Admin',
                    role: 'ADMIN',
                    status: 'ACTIVE'
                })
                .save();

            await admin.setPassword('SOME_PASS');

            const { token } = await authService.authenticateCredentials({
                body: {
                    email: 'some_admin@email.com',
                    password: 'SOME_PASS'
                }
            });

            const response = await request(server)
                .get('/api/v1/users?role=ADMIN&limit=1&skip=0')
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .expect(200)
                .end()
                .get('body');

            response.should.eql([
                {
                    _id: admin._id.toString(),
                    email: 'some_admin@email.com',
                    name: 'Dummy_Admin',
                    role: 'ADMIN',
                    status: 'ACTIVE'
                }
            ]);
        });

        it('Should return error if USER trying to get users', async () => {
            const user = await userRepository
                .User({
                    email: 'some@email.com',
                    name: 'Dummy',
                    role: 'USER',
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
                .get('/api/v1/users')
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .expect(405)
                .end();
        });
    });

    describe('Get user', () => {
        it('Should return user if exists', async () => {
            const user = await userRepository
                .User({
                    email: 'some_user@email.com',
                    name: 'Dummy_User',
                    role: 'USER',
                    status: 'ACTIVE'
                })
                .save();

            const admin = await userRepository
                .User({
                    email: 'some_admin@email.com',
                    name: 'Dummy_Admin',
                    role: 'ADMIN',
                    status: 'ACTIVE'
                })
                .save();

            await admin.setPassword('SOME_PASS');

            const { token } = await authService.authenticateCredentials({
                body: {
                    email: 'some_admin@email.com',
                    password: 'SOME_PASS'
                }
            });

            const response = await request(server)
                .get(`/api/v1/users/${user._id.toString()}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .expect(200)
                .end()
                .get('body');

            response.should.eql({
                _id: user._id.toString(),
                email: 'some_user@email.com',
                name: 'Dummy_User',
                role: 'USER',
                status: 'ACTIVE'
            });
        });

        it('Should return 404 error if user not exist', async () => {
            const admin = await userRepository
                .User({
                    email: 'some_admin@email.com',
                    name: 'Dummy_Admin',
                    role: 'ADMIN',
                    status: 'ACTIVE'
                })
                .save();

            await admin.setPassword('SOME_PASS');

            const { token } = await authService.authenticateCredentials({
                body: {
                    email: 'some_admin@email.com',
                    password: 'SOME_PASS'
                }
            });

            await request(server)
                .get('/api/v1/users/5ccde83788395342c0f64977')
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .expect(404)
                .end();
        });

        it('Should return 405 error if USER trying to get user', async () => {
            const user = await userRepository
                .User({
                    email: 'some@email.com',
                    name: 'Dummy',
                    role: 'USER',
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
                .get(`/api/v1/users/${user._id.toString()}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .expect(405)
                .end();
        });
    });

    describe('Delete user', () => {
        it('Should delete user', async () => {
            const user = await userRepository
                .User({
                    email: 'some_user@email.com',
                    name: 'Dummy_User',
                    role: 'USER',
                    status: 'ACTIVE'
                })
                .save();

            const admin = await userRepository
                .User({
                    email: 'some_admin@email.com',
                    name: 'Dummy_Admin',
                    role: 'ADMIN',
                    status: 'ACTIVE'
                })
                .save();

            await admin.setPassword('SOME_PASS');

            const { token } = await authService.authenticateCredentials({
                body: {
                    email: 'some_admin@email.com',
                    password: 'SOME_PASS'
                }
            });

            await request(server)
                .delete(`/api/v1/users/${user._id.toString()}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .expect(204)
                .end();

            const deletedUser = await userRepository.User.findById(user._id);

            sinon.assert.match(deletedUser, null);
        });

        it('Should return 404 error if user not exist', async () => {
            const admin = await userRepository
                .User({
                    email: 'some_admin@email.com',
                    name: 'Dummy_Admin',
                    role: 'ADMIN',
                    status: 'ACTIVE'
                })
                .save();

            await admin.setPassword('SOME_PASS');

            const { token } = await authService.authenticateCredentials({
                body: {
                    email: 'some_admin@email.com',
                    password: 'SOME_PASS'
                }
            });

            await request(server)
                .delete('/api/v1/users/5ccdec835d894846a5cf344c')
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .expect(404)
                .end();
        });

        it('Should return 405 error if USER trying to delete user', async () => {
            const user = await userRepository
                .User({
                    email: 'some_user@email.com',
                    name: 'Dummy_User',
                    role: 'USER',
                    status: 'ACTIVE'
                })
                .save();

            const user2 = await userRepository
                .User({
                    email: 'some_user_2@email.com',
                    name: 'Dummy_User_2',
                    role: 'USER',
                    status: 'ACTIVE'
                })
                .save();

            await user2.setPassword('SOME_PASS');

            const { token } = await authService.authenticateCredentials({
                body: {
                    email: 'some_user_2@email.com',
                    password: 'SOME_PASS'
                }
            });

            await request(server)
                .delete(`/api/v1/users/${user._id.toString()}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .expect(405)
                .end();
        });
    });
});
