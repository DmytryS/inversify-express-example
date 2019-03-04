import * as express from 'express';
import * as passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import * as errs from 'restify-errors';
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
        @inject(TYPES.UserModel) private userRepository: IUserRepository
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
                next(new errs.UnauthorizedError(err.message ? err.message : err));
            }

            if (!user) {
                next(new errs.UnauthorizedError(info));
            }

            // tslint:disable-next-line
            req['user'] = user;
            next();
        })(req, res, next);
    }

    public async authenticateCredentials(req: express.Request, res: express.Response) {
        // return new Promise((resolve, reject) =>
        this.passport.authenticate('local', { session: false }, (err, user) => {
            if (err) {
                res.status(401).json(new errs.UnauthorizedError(err.message ? err.message : err));
            } else {
                res.json(user);
            }
        })(req, res);
        // );
    }

    private applyJWTstrategy() {
        this.passport.use(
            'jwt',
            new JwtStrategy(
                {
                    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
                    secretOrKey: this.config.secret,
                    session: false
                },
                async (token, done) => {
                    if (!token || !token.id) {
                        done('Wrong token', false);
                    }

                    const user = await this.userRepository.User.findById(token.id);

                    if (!user) {
                        done('Wrong token', false);
                    }

                    done(false, user);
                }
            )
        );
    }

    private applyLocalStrategy() {
        this.passport.use(
            'local',
            new LocalStrategy(
                {
                    passReqToCallback: true,
                    passwordField: 'password',
                    session: false,
                    usernameField: 'email'
                },
                async (req, email, password, done) => {
                    try {
                        if (!req.body.type) {
                            throw new Error("'userType' field is required");
                        }
                        const { type } = req.body;
                        const user = await this.userRepository.User.findOne({
                            email,
                            type
                        });

                        // if (!user || !(await user.isValidPassword(password))) {
                        //     done('Wrong email or password', false);
                        // }

                        done(false, user);
                    } catch (err) {
                        return done(err);
                    }
                }
            )
        );
    }
}
