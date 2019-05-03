import * as express from 'express';

export default interface IAuthService {
    authMiddleware(config: { role: string }): any;
    authenticateJwt(req: express.Request, res: express.Response, next: express.NextFunction, role?: string): any;
    authenticateCredentials(req: express.Request): Promise<any>;
}
