import { promisify, promisifyAll } from 'bluebird';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as layouts from 'handlebars-layouts';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as Errs from 'restify-errors';
import TYPES from '../../constant/types';
import IConfigService from '../config/interface';
import { inject, ProvideSingleton } from '../ioc/ioc';
import ILog4js, { ILoggerService } from '../logger/interface';
import IMailerService from './interface';

const readFile = promisify(fs.readFile);

handlebars.registerHelper(layouts(handlebars));
handlebars.registerPartial(
    'layout',
    fs.readFileSync(path.join(__dirname, '../../templates/email', 'layout.hbs'), 'utf8')
);

@ProvideSingleton(TYPES.MailerService)
/**
 * Email sender class
 */
export default class MailerService implements IMailerService {
    private config;
    private logger: ILog4js;
    private tranport;

    /**
     * Constructs email sender
     * @param {LoggerService} loggerService logger service
     * @param {ConfigService} configService config service
     */
    constructor(
        @inject(TYPES.LoggerService) loggerService: ILoggerService,
        @inject(TYPES.ConfigServie) configService: IConfigService
    ) {
        this.config = configService.get('MAIL');
        this.logger = loggerService.getLogger('MAIL');

        if (process.env.NODE_ENV === 'test') {
            this.tranport = {
                sendMailAsync: Promise.resolve()
            };
        } else {
            this.tranport = promisifyAll(nodemailer.createTransport(this.config.transport_options));
        }

        const t = 67;
    }

    /**
     * Sends email to user
     * @param {String} email destination email
     * @param {String} templateName template name
     * @param {Object} templateData data to send
     * @returns {Promise} Returns promise which will be resolved mail sent
     */
    public async send(email, templateName, templateData) {
        try {
            const template = await this._getTemplate(templateName, templateData);
            const mailOptions = {
                from: this.config.from,
                html: template.body,
                subject: template.subject,
                to: email
            };

            const response = await this.tranport.sendMailAsync(mailOptions);

            this.logger.info(`Email was successfully sent to ${email}`);
            return response.message;
        } catch (err) {
            this.logger.error(`Email send was rejected by error: ${err}`);
            throw err;
        }
    }

    private async _getTemplate(templateName, data) {
        try {
            const bodyTemplate = await readFile(
                path.join(__dirname, '../../templates/email', templateName, 'html.hbs')
            );
            const subjectTemplate = await readFile(
                path.join(__dirname, '../../templates/email', templateName, 'subject.hbs')
            );

            return {
                body: handlebars.compile(bodyTemplate.toString())({ ...data }),
                subject: handlebars.compile(subjectTemplate.toString())({ ...data })
            };
        } catch (err) {
            this.logger.error('An error occured during mail send', err);
            throw new Errs.InternalError('An error occured during mail send');
        }
    }
}
