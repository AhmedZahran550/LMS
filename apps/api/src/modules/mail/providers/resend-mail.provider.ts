import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { MailProvider, SendMailOptions } from './mail-provider.interface';
import * as fs from 'fs';
import * as path from 'path';

function compileTemplate(templateName: string, context: Record<string, any>): string {
  try {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
    let content = fs.readFileSync(templatePath, 'utf-8');
    for (const [key, value] of Object.entries(context)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return content;
  } catch (error) {
    return JSON.stringify(context);
  }
}

@Injectable()
export class ResendMailProvider extends MailProvider {
  private resend: Resend;
  private readonly logger = new Logger(ResendMailProvider.name);

  constructor(private configService: ConfigService) {
    super();
    const apiKey = this.configService.get<string>('mail.resend.apiKey');
    this.resend = new Resend(apiKey);
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const html = compileTemplate(options.template, options.context);
    const from = this.configService.get<string>('mail.from');
    
    try {
      await this.resend.emails.send({
        from: from || 'onboarding@resend.dev', // Fallback for dev
        to: options.to,
        subject: options.subject,
        html,
      });
      this.logger.log(`Resend Email sent to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send Resend email to ${options.to}`, error);
    }
  }
}
