import express from 'express';
import passport from 'passport';
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

    constructor(
        @inject(TYPES.LoggerService) loggerService: ILoggerService,
        @inject(TYPES.ConfigServie) configService: IConfigService,
        @inject(TYPES.UserModel) private userRepository: IUserRepository
    ) {
        this.config = configService.get('AUTH');
        this.logger = loggerService.getLogger('AuthService');

        this.applyJWTstrategy();
        this.applyLocalStrategy();
    }

    public async authenticateJwt(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        passport.authenticate(
            `jwt`,
            { session: false },
            (err, user, info) => {
                if (err) {
                    next(new errs.UnauthorizedError(err.message ? err.message : err));
                }

                if (!user) {
                    next(new errs.UnauthorizedError(info));
                }

                req.user = user;
                next();
            },
        )(req, res, next);
    }

    public async authenticateCredentials(
        req: express.Request
    ) {
        return new Promise((resolve, reject) =>
            passport.authenticate(
                'local',
                { session: false },
                (err, user) => {
                    if (err) {
                        reject(new errs.UnauthorizedError(err.message ? err.message : err));
                    } else {
                        resolve(user);
                    }
                }
            )(req)
        );
    }

    private applyJWTstrategy() {
        passport.use(`jwt`, new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromHeader('authorization'),
                secretOrKey: this.config.secret,
                session: false,
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
        ));
    }

    private applyLocalStrategy() {
        passport.use('local', new LocalStrategy(
            {
                passReqToCallback: true,
                passwordField: 'password',
                session: false,
                usernameField: 'email',
            },
            async (req, email, password, done) => {
                try {
                    if (!req.body.userType) {
                        throw new Error('\'userType\' field is required');
                    }
                    const { userType } = req.body;
                    const user = await this.userRepository.User.findOne({
                        email,
                        type: userType,
                    });

                    // if (!user || !(await user.isValidPassword(password))) {
                    //     done('Wrong email or password', false);
                    // }

                    done(false, user);
                } catch (err) {
                    return done(err);
                }
            }
        ));
    }
}
