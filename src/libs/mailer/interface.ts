export default interface IMailSender {
    send(
        targetEmail: string,
        templateName: string,
        templateData: object
    ): Promise<void>;
}
