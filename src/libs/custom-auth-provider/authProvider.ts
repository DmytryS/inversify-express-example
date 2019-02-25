import { injectable } from "inversify";
import { interfaces } from "inversify-express-utils";
import { authService } from '../../constant/decorators'
import IAuthService from '../auth/interface';
import Principal from '../principal/principal';

@injectable()
export default class CustomAuthProvider implements interfaces.AuthProvider {

    @authService private readonly _authService: IAuthService;

    public async getUser(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ): Promise<interfaces.Principal> {
        const token = req.headers["authorization"]
        const user = await this._authService.getUserByJWT(token);
        const principal = new Principal(user);
        return principal;
    }

}
