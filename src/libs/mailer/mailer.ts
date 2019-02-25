import { injectable } from 'inversify';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as layouts from 'handlebars-layouts';
import { promisifyAll, promisify } from 'bluebird';
import * as path from 'path';
import * as fs from 'fs';
import { logger, config } from '../../constant/decorators';
import IMailSender from './interface';
import ILog4js, { ILogger } from '../logger/interface';
import IConfig from '../config/interface'
import * as Errs from 'restify-errors';

const readFile = promisify(fs.readFile);

handlebars.registerHelper(layouts(handlebars));
handlebars.registerPartial('layout', fs.readFileSync(path.join(__dirname, '../../templates/email', 'layout.hbs'), 'utf8'));

@injectable()
/**
 * Email sender class
 */
export default class MailSender implements IMailSender {
    private _config;
    private _logger: ILog4js;
    private _tranport;

    /**
     * Constructs email sender
     * @param {Object} config config
     */
    constructor(
        @logger loggerService: ILogger,
        @config config: IConfig
    ) {
        this._config = config.get('MAIL');
        this._logger = loggerService.getLogger('MAIL');

        if (process.env.NODE_ENV === 'test') {
            this._tranport = {
                sendMailAsync: Promise.resolve()
            };
        } else {
            this._tranport = promisifyAll(
                nodemailer.createTransport(this._config.transport_options)
            );
        }
    }

    /**
     * Sends email to user
     * @param {String} email destination email
     * @param {String} templateName template name
     * @param {Object} templateData data to send
     * @returns {Promise} Returns promise which will be resolved mail sent
     */
    async send(email, templateName, templateData) {
        try {
            const template = await this._getTemplate(templateName, templateData);
            const mailOptions = {
                from: this._config.from,
                to: email,
                subject: template.subject,
                html: template.body
            };

            const response = await this._tranport.sendMailAsync(mailOptions);

            this._logger.info(`Email was successfully sent to ${email}`);
            return response.message;
        } catch (err) {
            this._logger.error(`Email send was rejected by error: ${err}`);
            throw err;
        }
    }

    private async _getTemplate(templateName, data) {
        try {
            const bodyTemplate = await readFile(path.join(__dirname, '../../templates/email', templateName, 'html.hbs'));
            const subjectTemplate = await readFile(path.join(__dirname, '../../templates/email', templateName, 'subject.hbs'));

            return {
                body: handlebars.compile(bodyTemplate.toString())({ ...data }),
                subject: handlebars.compile(subjectTemplate.toString())({ ...data })
            };
        } catch (err) {
            this._logger.error('An error occured during mail send', err);
            throw new Errs.InternalError('An error occured during mail send');
        }
    }
}