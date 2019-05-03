import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import * as passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { InvalidArgumentError, UnauthorizedError } from 'restify-errors';
import TYPES from '../../constant/types';
import { IUserRepository } from '../../models/user/interface';
import IConfigService from '../config/interface';
import { inject, ProvideSingleton } from '../ioc/ioc';
import ILog4js, { ILoggerService } from '../logger/interface';
import IAuthService from './interface';

@ProvideSingleton(TYPES.AuthService)
export default class AuthService implements IAuthService {
    private config;
    private logger: ILog4js;
    private passport;

    constructor(
        @inject(TYPES.LoggerService) loggerService: ILoggerService,
        @inject(TYPES.ConfigServie) configService: IConfigService,
        @inject(TYPES.UserRepository) private userRepository: IUserRepository
    ) {
        this.config = configService.get('AUTH');
        this.logger = loggerService.getLogger('AuthService');
        this.passport = passport;

        this.applyJWTstrategy();
        this.applyLocalStrategy();
    }

    public async authenticateJwt(req: express.Request, res: express.Response, next: express.NextFunction) {
        this.passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (err) {
                next(new UnauthorizedError(err.message ? err.message : err));
            }

            if (!user) {
                next(new UnauthorizedError(info));
            }

            // tslint:disable-next-line
            req['user'] = user;
            next();
        })(req, res, next);
    }

    public async authenticateCredentials(req: express.Request) {
        return new Promise((resolve, reject) =>
            this.passport.authenticate('local', { session: false }, async (err, user) => {
                try {
                    if (err) {
                        throw err;
                    }

                    if (!user) {
                        throw new UnauthorizedError('Something went wrong. Please contact system administrator');
                    }

                    user = user.toJSON();

                    delete user.__v;
                    delete user.passwordHash;

                    const expires = moment().add(
                        parseInt(this.config.expiresIn.slice(0, -1), 10),
                        this.config.expiresIn.slice(-1)
                    );
                    const token = jwt.sign(user, this.config.secret, {
                        expiresIn: this.config.expiresIn
                    });

                    resolve({ token, expires });
                } catch (err) {
                    reject(err);
                }
            })(req)
        );
    }

    private applyJWTstrategy() {
        this.passport.use(
            'jwt',
            new JwtStrategy(
                {
                    jwtFromRequest: ExtractJwt.fromHeader('Authorization'),
                    secretOrKey: this.config.secret
                },
                async (token, done) => {
                    try {
                        if (!token || !token.id) {
                            throw new UnauthorizedError('Wrong token');
                        }

                        const user = await this.userRepository.User.findById(token.id);

                        if (!user) {
                            throw new UnauthorizedError('Wrong token');
                        }
                    } catch (err) {
                        done(err, false);
                    }
                }
            )
        );
    }

    private applyLocalStrategy() {
        this.passport.use(
            'local',
            new LocalStrategy(
                {
                    passwordField: 'password',
                    session: false,
                    usernameField: 'email'
                },
                async (email, password, done) => {
                    try {
                        const user = await this.userRepository.User.findOne({
                            email
                        });

                        if (!user || !(await user.isValidPassword(password))) {
                            throw new UnauthorizedError('Wrong email or password');
                        }

                        if (user && user.status === 'BANNED') {
                            throw new UnauthorizedError(
                                'Your account has been banned. Please contact system administrator'
                            );
                        }

                        done(false, user);
                    } catch (err) {
                        done(err, false);
                    }
                }
            )
        );
    }
}
