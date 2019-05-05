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
let actionRepository;

describe('Action service', () => {
    before(async () => {
        app = new App();

        await app.start();
        server = app.server;

        sandbox = sinon.createSandbox();
        userRepository = container.get(TYPES.UserRepository);
        actionRepository = container.get(TYPES.ActionRepository);
    });

    after(async () => {
        await app.stop();
    });

    beforeEach(async () => {
        await app.clearDb();
        sandbox.restore();
    });

    describe('Get action', () => {
        it('should return action if exists', async () => {
            const mailerStub = sandbox.stub(container.get(TYPES.MailerService), 'send').returns(Promise.resolve());

            const registeredUserResponse = await request(server)
                .put('/api/v1/users')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ email: 'some@email.com', name: 'userName' })
                .expect(200)
                .end()
                .get('body');

            sinon.assert.match(registeredUserResponse, { _id: sinon.match.string });
            mailerStub.should.have.been.calledOnce;

            const action = await actionRepository.Action.findOne({ userId: registeredUserResponse._id });

            const response = await request(server)
                .get(`/api/v1/actions/${action._id.toString()}`)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect(200)
                .end()
                .get('body');

            response.should.eql({
                _id: action._id.toString(),
                status: 'ACTIVE',
                type: 'REGISTER'
            });
        });

        it('should return 404 if action not exists', async () => {
            await request(server)
                .get('/api/v1/actions/5ccd6e70609188112d7a1371')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect(404)
                .end();
        });
    });

    describe('Set password', () => {
        it('should set password for new user', async () => {
            const user = await userRepository
                .User({
                    email: 'some@email.com',
                    name: 'Dummy_2',
                    role: 'USER',
                    status: 'ACTIVE'
                })
                .save();

            const action = await new actionRepository.Action({
                status: 'ACTIVE',
                type: 'REGISTER',
                userId: user._id
            }).save();

            await request(server)
                .post(`/api/v1/actions/${action._id.toString()}`)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ password: 'SOME_NEW_PASS' })
                .expect(204)
                .end()
                .get('body');

            const updatedUser = await userRepository.User.findById(user._id);
            const updatedAction = await actionRepository.Action.findById(action._id);

            updatedAction.status.should.eql('USED');

            updatedUser.passwordHash.should.be.a('string');
        });

        it('should reset password for existing user', async () => {
            let user = await userRepository
                .User({
                    email: 'some@email.com',
                    name: 'Dummy_2',
                    role: 'USER',
                    status: 'ACTIVE'
                })
                .save();

            user = await user.setPassword('SOME_PASS');

            const action = await new actionRepository.Action({
                status: 'ACTIVE',
                type: 'RESET_PASSWORD',
                userId: user._id
            }).save();

            await request(server)
                .post(`/api/v1/actions/${action._id.toString()}`)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ password: 'SOME_NEW_PASS' })
                .expect(204)
                .end()
                .get('body');

            const updatedUser = await userRepository.User.findById(user._id);
            const updatedAction = await actionRepository.Action.findById(action._id);

            updatedAction.status.should.eql('USED');
            updatedUser.passwordHash.should.be.a('string');
            updatedUser.passwordHash.should.not.eql(user.passwordHash);
        });

        it('should return 404 error if user for action deleted', async () => {
            const action = await new actionRepository.Action({
                status: 'ACTIVE',
                type: 'REGISTER',
                userId: '5cce9e6d2be746695e291fcf'
            }).save();

            await request(server)
                .post(`/api/v1/actions/${action._id.toString()}`)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ password: 'SOME_NEW_PASS' })
                .expect(404)
                .end();
        });

        it('should return 409 error if action used', async () => {
            const user = await userRepository
                .User({
                    email: 'some@email.com',
                    name: 'Dummy_2',
                    role: 'USER',
                    status: 'ACTIVE'
                })
                .save();

            const action = await new actionRepository.Action({
                status: 'ACTIVE',
                type: 'REGISTER',
                userId: user._id
            }).save();

            await request(server)
                .post(`/api/v1/actions/${action._id.toString()}`)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ password: 'SOME_NEW_PASS' })
                .expect(204)
                .end()
                .get('body');

            await request(server)
                .post(`/api/v1/actions/${action._id.toString()}`)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ password: 'SOME_NEW_PASS' })
                .expect(409)
                .end();
        });
    });
});
