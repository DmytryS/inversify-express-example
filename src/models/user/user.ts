import {
    prop,
    Typegoose,
    ModelType,
    instanceMethod,
    InstanceType
} from 'typegoose';
import bcrypt from 'bcrypt';
import IUser from './interface';
import { inject, provide } from '../../libs/ioc/ioc';
import TYPES from '../../constant/types';
import IConfigService from '../../libs/config/interface';

export type status = 'ACTIVE' | 'PENDING';
export type type = 'DRIVER' | 'RIDER' | 'ADMIN';

class User extends Typegoose implements ModelType<IUser> {
    @prop()
    name: string;
    @prop()
    email: string;
    @prop()
    passwordHash: string;
    @prop()
    type: type;
    @prop()
    status: status;

    /**
     * Checks user password
     * @param {String} candidatePassword candidate password
     * @returns {Promise<Boolean>} promise which will be resolved when password compared
     */
    @instanceMethod
    async isValidPassword(
        this: InstanceType<User> & typeof User,
        candidatePassword: string
    ) {
        if (!candidatePassword) {
            return false;
        }
        if (!this.passwordHash) {
            return false;
        }
        return await bcrypt.compare(candidatePassword, this.passwordHash);
    }

    /**
     * Sets user password
     * @param {String} password password to set
     * @returns {Promise<>} promise which will be resolved when password set
     */
    @instanceMethod
    async setPassword(
        this: InstanceType<User> & typeof User,
        password: string
    ) {
        if (password) {
            this.passwordHash = await bcrypt.hash(password, this._config.saltRounds);
        } else {
            this.passwordHash = undefined;
        }
        return this.save();
    }
}

@provide(TYPES.UserModel)
export default class UserRepository {
    private _config;
    public User;

    constructor(
        @inject(TYPES.ConfigServie) config: IConfigService
    ) {
        this._config = config.get('AUTH');

        this.User = new User().getModelForClass(User);
    }
}
