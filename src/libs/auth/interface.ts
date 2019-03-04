import * as express from 'express';

export default interface IAuthService {
    authenticateJwt(req: express.Request, res: express.Response, next: express.NextFunction): any;
    authenticateCredentials(req: express.Request): Promise<any>;
}
