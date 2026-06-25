import { Module } from '@nestjs/common';

import { LogsService } from './logs.service';
import { Log } from '../../db/entities/log.entity';

@Module({
  imports: [],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
