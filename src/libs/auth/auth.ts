import { injectable } from "inversify";
import { logger, config, userRepository} from '../../constant/decorators';
import IAuthService from './interface';
import ILog4js, { ILogger } from '../logger/interface';
import IConfig from '../config/interface';
import { IUserRepository } from '../../repository/user/interface';

@injectable()
export default class AuthService implements IAuthService {
    private _config;
    private _logger: ILog4js;

    constructor(
        @logger loggerService: ILogger,
        @config config: IConfig,
        @userRepository userRepository: IUserRepository
    ) {
        this._config = config.get('DB');
        this._logger = loggerService.getLogger('Database');
    }

    public async getUserByJWT(token: string): Promise<object> {

        const principal = new Principal(user);
        return principal;
    }

    public async getUserByCredentials(email: string, password: string) {
        return {};
    }
}
