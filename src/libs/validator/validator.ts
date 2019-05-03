import { inject, ProvideSingleton } from '../ioc/ioc';
import TYPES from '../../constant/types';
import * as validator from '@hapi/joi';

/**
 * Provides means to validate DTOs and models
 */
@ProvideSingleton(TYPES.ValidatorService)
export class Validator {
    /**
     * validator module
     * @returns {Function} validator module
     */
    get validator() {
        return validator;
    }

    /**
     * validator module
     * @returns {Function} validator module
     */
    get rules() {
        return validator;
    }

    /**
     * Validates a model or a value
     * @param {Object} rules validation rules
     * @param {Object} toValidate value to validate
     * @param {Function(err:Error)} next error callback
     * @returns {Boolean} Returns null if validation failed, value otherwise
     */
    public validate(rules, toValidate, next) {
        const { error, value } = validator.validate(toValidate, rules);

        if (error) {
            const errMsg = error.details.map((detail) => detail.message).join('. ');
            if (next) {
                return next(new Error(errMsg));
            }
            throw new Error(errMsg);
        }

        return value;
    }
}

/**
 * Validatior instance
 */
export default new Validator();
