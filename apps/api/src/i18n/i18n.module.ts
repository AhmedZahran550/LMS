import { Global, Module } from '@nestjs/common';
import { I18nModule as NestI18nModule, I18nJsonLoader } from 'nestjs-i18n';
import * as path from 'path';

@Global()
@Module({
  imports: [
    NestI18nModule.forRoot({
      fallbackLanguage: 'ar',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(__dirname, './'),
        watch: false,
      },
    }),
  ],
  exports: [NestI18nModule],
})
export class I18nModule {}
