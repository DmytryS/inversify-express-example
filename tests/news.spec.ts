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
let newsRepository;
let authService;

describe('News service', () => {
    before(async () => {
        app = new App();

        await app.start();
        server = app.server;

        sandbox = sinon.createSandbox();
        userRepository = container.get(TYPES.UserRepository);
        newsRepository = container.get(TYPES.NewsRepository);
        authService = container.get(TYPES.AuthService);
    });

    after(async () => {
        await app.stop();
    });

    beforeEach(async () => {
        await app.clearDb();
        sandbox.restore();
    });

    describe('Get news by id', () => {
        it('should return news if exists', async () => {
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

            const news = await newsRepository
                .News({
                    name: 'Test news 1',
                    text: 'Some news text'
                })
                .save();

            const response = await request(server)
                .get(`/api/v1/news/${news._id.toString()}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .expect(200)
                .end()
                .get('body');

            response.should.eql({
                _id: news._id.toString(),
                name: 'Test news 1',
                text: 'Some news text'
            });
        });

        it('should return 404 error if news not exist', async () => {
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
                .get('/api/v1/news/5ccdd7fde38335358eee25c6')
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .expect(404)
                .end();
        });

        it('should return 401 if unauthorized', async () => {
            const news = await newsRepository
                .News({
                    name: 'Test news 1',
                    text: 'Some news text'
                })
                .save();

            await request(server)
                .get(`/api/v1/news/${news._id.toString()}`)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect(401)
                .end();
        });
    });

    describe('Create news', () => {
        it('should return created news', async () => {
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
                .put('/api/v1/news')
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .send({ name: 'Test Header', text: 'Text for test' })
                .expect(200)
                .end()
                .get('body');

            sinon.assert.match(response, {
                _id: sinon.match.string,
                name: 'Test Header',
                text: 'Text for test'
            });
        });

        it('should return 401 error if unauthorized', async () => {
            await request(server)
                .put('/api/v1/news')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ name: 'Test Header', text: 'Text for test' })
                .expect(401)
                .end();
        });
    });

    describe('Delete news', () => {
        it('should delete news by id', async () => {
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

            const news = await newsRepository
                .News({
                    name: 'News_1',
                    text: 'Text_2'
                })
                .save();

            await request(server)
                .delete(`/api/v1/news/${news._id.toString()}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .expect(204)
                .end();

            const deletedNews = await newsRepository.News.findById(news._id);

            sinon.assert.match(deletedNews, null);
        });

        it('should return 404 error if news not exist', async () => {
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
                .delete('/api/v1/news/5ccdd7fde38335358eee25c6')
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .expect(404)
                .end();
        });

        it('should return 404 error if unauthorized', async () => {
            const news = await newsRepository
                .News({
                    name: 'News_1',
                    text: 'Text_2'
                })
                .save();

            await request(server)
                .delete(`/api/v1/news/${news._id.toString()}`)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect(401)
                .end();
        });
    });

    describe('News update', () => {
        it('Should update news by id', async () => {
            const news = await newsRepository
                .News({
                    name: 'News_1',
                    text: 'Text_2'
                })
                .save();

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
                .post(`/api/v1/news/${news._id.toString()}`)
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .send({ name: 'News_3', text: 'Text_4' })
                .expect(200)
                .end()
                .get('body');

            response.should.eql({
                _id: news._id.toString(),
                name: 'News_3',
                text: 'Text_4'
            });
        });

        it('should return 404 error if news not exist', async () => {
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
                .post('/api/v1/news/5cce9b37c841ea655b5eef15')
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .send({ name: 'News_3', text: 'Text_4' })
                .expect(404)
                .end();
        });

        it('should 401 error if unauthorized', async () => {
            const news = await newsRepository
                .News({
                    name: 'News_1',
                    text: 'Text_2'
                })
                .save();

            await request(server)
                .post(`/api/v1/news/${news._id.toString()}`)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({ name: 'News_3', text: 'Text_4s' })
                .expect(401)
                .end();
        });
    });

    describe('Get news', () => {
        it('should return array of news', async () => {
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

            const news1 = await newsRepository
                .News({
                    name: 'Test news 1',
                    text: 'Some news text'
                })
                .save();

            const news2 = await newsRepository
                .News({
                    name: 'Test news 2',
                    text: 'Some another news text'
                })
                .save();

            const response = await request(server)
                .get('/api/v1/news')
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .expect(200)
                .end()
                .get('body');

            response.should.eql([
                {
                    _id: news1._id.toString(),
                    name: 'Test news 1',
                    text: 'Some news text'
                },
                {
                    _id: news2._id.toString(),
                    name: 'Test news 2',
                    text: 'Some another news text'
                }
            ]);
        });

        it('should return paginated array of news', async () => {
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

            const news1 = await newsRepository
                .News({
                    name: 'Test news 1',
                    text: 'Some news text'
                })
                .save();

            const news2 = await newsRepository
                .News({
                    name: 'Test news 2',
                    text: 'Some another news text'
                })
                .save();

            const response = await request(server)
                .get('/api/v1/news?skip=1&limit=1')
                .set('Accept', 'application/json')
                .set('Authorization', token)
                .set('Content-Type', 'application/json')
                .expect(200)
                .end()
                .get('body');

            response.should.eql([
                {
                    _id: news2._id.toString(),
                    name: 'Test news 2',
                    text: 'Some another news text'
                }
            ]);
        });

        it('should return 401 error if unauthorized', async () => {
            await newsRepository
                .News({
                    name: 'Test news 1',
                    text: 'Some news text'
                })
                .save();

            await request(server)
                .get('/api/v1/news')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect(401)
                .end();
        });
    });
});
