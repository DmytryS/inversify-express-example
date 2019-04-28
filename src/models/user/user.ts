import * as bcrypt from 'bcrypt';
import { ApiModel, ApiModelProperty } from 'swagger-express-ts';
import { instanceMethod, InstanceType, ModelType, prop, Typegoose } from 'typegoose';
import TYPES from '../../constant/types';
import IConfigService from '../../libs/config/interface';
import { inject, provide } from '../../libs/ioc/ioc';
import IUser from './interface';

export type status = 'ACTIVE' | 'PENDING' | 'BANNED';
export type type = 'DRIVER' | 'RIDER' | 'ADMIN';

let config;

@ApiModel({
    description: 'User description',
    name: 'User'
})
class User extends Typegoose implements ModelType<IUser> {
    public static config;

    @prop({ required: true })
    @ApiModelProperty({
        description: 'Name of user',
        example: ['Name Surname'],
        required: true,
        type: 'string'
    })
    public name: string;

    @prop({ required: true })
    @ApiModelProperty({
        description: 'Email of user',
        example: ['some@mail.com'],
        required: true,
        type: 'string'
    })
    public email: string;

    @prop()
    public passwordHash: string;

    @prop({ required: true })
    @ApiModelProperty({
        description: 'Type of user',
        example: ['DRIVER', 'RIDER', 'ADMIN'],
        required: true,
        type: 'string'
    })
    public type: type;

    @prop({ required: true })
    @ApiModelProperty({
        description: 'Status of user',
        example: ['ACTIVE', 'PENDING'],
        required: true,
        type: 'string'
    })
    public status: status;

    /**
     * Checks user password
     * @param {String} candidatePassword candidate password
     * @returns {Promise<Boolean>} promise which will be resolved when password compared
     */
    @instanceMethod
    public async isValidPassword(this: InstanceType<User> & typeof User, candidatePassword: string) {
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
    public async setPassword(this: InstanceType<User> & typeof User, password: string) {
        this.passwordHash = password ? await bcrypt.hash(password, config.saltRounds) : undefined;

        return this.save();
    }

    /**
     * Sets user status to ACTIVE
     * @returns {Promise<>} promise which will be resolved when password set
     */
    @instanceMethod
    public async activate(this: InstanceType<User> & typeof User) {
        this.status = 'ACTIVE';

        return this.save();
    }
}

@provide(TYPES.UserModel)
// tslint:disable-next-line
export default class UserRepository {
    public User;
    private config;

    constructor(@inject(TYPES.ConfigServie) configService: IConfigService) {
        this.config = configService.get('AUTH');

        config = this.config;

        this.User = new User().getModelForClass(User);
    }
}
