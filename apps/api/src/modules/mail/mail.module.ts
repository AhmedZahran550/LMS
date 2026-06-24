import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailProvider } from './providers/mail-provider.interface';
import { SmtpMailProvider } from './providers/smtp-mail.provider';
import { ResendMailProvider } from './providers/resend-mail.provider';

@Module({
  providers: [
    {
      provide: MailProvider,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('mail.provider');
        if (provider === 'resend') {
          return new ResendMailProvider(configService);
        }
        return new SmtpMailProvider(configService);
      },
      inject: [ConfigService],
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
