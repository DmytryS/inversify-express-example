import bcrypt from 'bcrypt';
import { ApiModel, ApiModelProperty } from 'swagger-express-ts';
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

@ApiModel({
    description: 'User description',
    name: 'User'
})
class User extends Typegoose implements ModelType<IUser> {
    @prop()
    @ApiModelProperty({
        description: 'Id of user',
        example: ['5c766d614e86ea27c61cf82a'],
        required: true
    })
    public name: string;
    @prop()
    @ApiModelProperty({
        description: 'Email of user',
        example: ['some@mail.com'],
        required: true
    })
    public email: string;
    @prop()
    public passwordHash: string;
    @prop()
    @ApiModelProperty({
        description: 'Type of user',
        example: ['DRIVER', 'RIDER', 'ADMIN'],
        required: true
    })
    public type: type;
    @prop()
    @ApiModelProperty({
        description: 'Status of user',
        example: ['ACTIVE', 'PENDING'],
        required: true
    })
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
