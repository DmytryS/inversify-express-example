
import * as assert from 'assert';
import * as jwt from 'jsonwebtoken';
import * as errs from 'restify-errors';

export default function auth(JWT_SECRET: string, opts) {
    const { allowedGlobalMethods = [] } = opts;
    return async function (req, res, next) {
        if (/\/api\/v1\/users\/login\/?/.test(req.url)
            || /\/api\/v1\/users\/register?/.test(req.url)
            || /\/api\/v1\/actions\/?/.test(req.url)) {
            return next();
        }

        if (allowedGlobalMethods.includes(req.method)) {
            return next();
        }

        try {
            const bearerHeader = req.headers['authorization'];
            assert.ok(bearerHeader, 'Missing authorization header');
            const token = bearerHeader.split(' ')[1];
            assert.ok(token, 'Missing token value');
            const decoded = await jwt.verify(token, JWT_SECRET);
            req.decoded = decoded;
            next();
        } catch (e) {
            next(new errs.UnauthorizedError(e.message));
        }
    }
}
