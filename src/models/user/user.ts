import bcrypt from 'bcrypt';
import {
    instanceMethod,
    InstanceType,
    ModelType,
    prop,
    Typegoose
} from 'typegoose';
import TYPES from '../../constant/types';
import IConfigService from '../../libs/config/interface';
import { inject, provide } from '../../libs/ioc/ioc';
import IUser from './interface';

export type status = 'ACTIVE' | 'PENDING';
export type type = 'DRIVER' | 'RIDER' | 'ADMIN';

class User extends Typegoose implements ModelType<IUser> {
    @prop()
    public name: string;
    @prop()
    public email: string;
    @prop()
    public passwordHash: string;
    @prop()
    public type: type;
    @prop()
    public status: status;

    /**
     * Checks user password
     * @param {String} candidatePassword candidate password
     * @returns {Promise<Boolean>} promise which will be resolved when password compared
     */
    @instanceMethod
    public async isValidPassword(
        this: InstanceType<User> & typeof User,
        candidatePassword: string
    ) {
        if (!candidatePassword) {
            return false;
        }
        if (!this.passwordHash) {
            return false;
        }
        return bcrypt.compare(candidatePassword, this.passwordHash);
    }

    /**
     * Sets user password
     * @param {String} password password to set
     * @returns {Promise<>} promise which will be resolved when password set
     */
    @instanceMethod
    public async setPassword(
        this: InstanceType<User> & typeof User,
        password: string
    ) {
        this.passwordHash = password ? await bcrypt.hash(password, this._config.saltRounds) : undefined;

        return this.save();
    }
}

@provide(TYPES.UserModel)
// tslint:disable-next-line
export default class UserRepository {
    public User;
    private config;

    constructor(
        @inject(TYPES.ConfigServie) configService: IConfigService
    ) {
        this.config = configService.get('AUTH');

        this.User = new User().getModelForClass(User);
    }
}
