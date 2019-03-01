export default interface IMailerService {
    send(
        targetEmail: string,
        templateName: string,
        templateData: object
    ): Promise<void>;
}
