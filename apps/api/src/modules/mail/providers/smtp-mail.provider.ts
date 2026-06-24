import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailProvider, SendMailOptions } from './mail-provider.interface';
import * as fs from 'fs';
import * as path from 'path';

// Simple poor-man's handlebars equivalent for the sake of example without adding hbs dependency globally just yet
// In a real app, you'd use @nestjs-modules/mailer with handlebars adapter
function compileTemplate(templateName: string, context: Record<string, any>): string {
  try {
    const templatePath = path.join(__dirname, '../../templates', `${templateName}.hbs`);
    let content = fs.readFileSync(templatePath, 'utf-8');
    for (const [key, value] of Object.entries(context)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return content;
  } catch (error) {
    return JSON.stringify(context); // Fallback
  }
}

@Injectable()
export class SmtpMailProvider extends MailProvider {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(SmtpMailProvider.name);

  constructor(private configService: ConfigService) {
    super();
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.smtp.host'),
      port: this.configService.get<number>('mail.smtp.port'),
      auth: {
        user: this.configService.get<string>('mail.smtp.user'),
        pass: this.configService.get<string>('mail.smtp.pass'),
      },
    });
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const html = compileTemplate(options.template, options.context);
    const from = this.configService.get<string>('mail.from');
    
    try {
      await this.transporter.sendMail({
        from,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        html,
      });
      this.logger.log(`SMTP Email sent to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send SMTP email to ${options.to}`, error);
    }
  }
}
