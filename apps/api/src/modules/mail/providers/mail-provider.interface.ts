export interface SendMailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, any>;
}

export abstract class MailProvider {
  abstract sendMail(options: SendMailOptions): Promise<void>;
}
