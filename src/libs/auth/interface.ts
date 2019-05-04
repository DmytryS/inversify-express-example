import * as express from 'express';

export default interface IAuthService {
    // authMiddleware(config: { role: string }): any; authenticateJwt
    handler(req: express.Request, res: express.Response, next: express.NextFunction): any;
    authenticateCredentials(req: express.Request): Promise<any>;
}
