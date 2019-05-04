export interface IValidatorService {
    rules(): any;
    validate(rules: any, toValidate: any, next?: any): any;
}

export default IValidatorService;
