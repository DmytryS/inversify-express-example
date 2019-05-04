export default interface IMailerServiceService {
    send(targetEmail: string, templateName: string, templateData: object): Promise<void>;
}
