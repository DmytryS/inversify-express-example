import { ProvideSingleton, inject } from '../ioc/ioc';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import * as errs from 'restify-errors';
import express from 'express';
import IAuthService from './interface';
import ILog4js, { ILoggerService } from '../logger/interface';
import IConfigService from '../config/interface';
import { IUserRepository } from '../../models/user/interface';
import TYPES from '../../constant/types';

@ProvideSingleton(TYPES.AuthService)
export default class AuthService implements IAuthService {
    private _config;
    private _logger: ILog4js;

    constructor(
        @inject(TYPES.LoggerService) loggerService: ILoggerService,
        @inject(TYPES.ConfigServie) config: IConfigService,
        @inject(TYPES.UserModel) private userRepository: IUserRepository
    ) {
        this._config = config.get('AUTH');
        this._logger = loggerService.getLogger('AuthService');

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
                if(err) {
                    next(new errs.UnauthorizedError(err.message ? err.message : err));
                }

                if(!user) {
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
                    if(err) {
                        reject(new new errs.UnauthorizedError(err.message ? err.message : err));
                    } else {
                        resolve(user);
                    }
                }
            )(req)
        )
    }

    private applyJWTstrategy() {
        passport.use(`jwt`, new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromHeader('authorization'),
                secretOrKey: this._config.secret,
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
        ));
    }

    private applyLocalStrategy() {
        passport.use('local', new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                session: false,
                passReqToCallback: true
            },
            async (req, email, password, done) => {
                try {
                if (!req.body.userType) {
                    throw new Error('\'userType\' field is required');
                }
                const { userType } = req.body;
                const user = await this.userRepository.User.findOne({
                    email,
                    type: userType
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
