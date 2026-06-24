import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogsService } from '../../modules/logs/logs.service';
import { redactSensitiveData } from '../utils/redact.util';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logsService: LogsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, ip, body } = req;

    const skipBody = originalUrl?.startsWith('/api/auth/') || originalUrl?.startsWith('/api/token');

    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const statusCode = res.statusCode;

      const user = (req as any).user;
      const userId = user?.id || null;

      const redactedBody = !skipBody && body && Object.keys(body).length > 0
        ? redactSensitiveData(body)
        : null;

      this.logsService.create({
        method,
        url: originalUrl,
        ip: ip || req.headers['x-forwarded-for']?.toString(),
        userId,
        statusCode,
        responseTime,
        requestBody: redactedBody,
      }).catch(err => {
        console.error('Failed to save log to database', err);
      });
    });

    next();
  }
}
