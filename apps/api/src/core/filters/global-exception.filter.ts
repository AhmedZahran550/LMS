import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response, Request } from "express";
import { I18nService } from "nestjs-i18n";

const STATUS_TO_ERROR_CODE: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: "BAD_REQUEST",
  [HttpStatus.UNAUTHORIZED]: "INVALID_CREDENTIALS",
  [HttpStatus.FORBIDDEN]: "FORBIDDEN",
  [HttpStatus.NOT_FOUND]: "RESOURCE_NOT_FOUND",
  [HttpStatus.CONFLICT]: "CONFLICT",
  [HttpStatus.UNPROCESSABLE_ENTITY]: "INVALID_FORMAT",
  [HttpStatus.TOO_MANY_REQUESTS]: "BAD_REQUEST",
  [HttpStatus.INTERNAL_SERVER_ERROR]: "INTERNAL_ERROR",
};

const MESSAGE_TO_ERROR_CODE: Record<string, string> = {
  "Invalid credentials": "INVALID_CREDENTIALS",
  "Email already exists": "EMAIL_EXISTS",
  "Please verify your email before logging in": "VERIFY_EMAIL",
  "Account is inactive": "ACCOUNT_INACTIVE",
  "Refresh token is missing": "REFRESH_TOKEN_MISSING",
  "Invalid refresh token": "INVALID_CREDENTIALS",
  "Invalid or expired refresh token": "INVALID_CREDENTIALS",
  "Invalid or expired verification token": "BAD_REQUEST",
  "User with this email does not exist": "NOT_FOUND",
  "Email is already verified": "CONFLICT",
  "Invalid or expired password reset token": "BAD_REQUEST",
  "Resource not found.": "RESOURCE_NOT_FOUND",
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly i18nService: I18nService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    console.log(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exResponse = exception.getResponse();

      let rawMessage: string = "Unknown error";
      let errorCode: string;

      if (typeof exResponse === "string") {
        rawMessage = exResponse;
        errorCode = MESSAGE_TO_ERROR_CODE[rawMessage] || STATUS_TO_ERROR_CODE[status] || "INTERNAL_ERROR";
      } else if (typeof exResponse === "object") {
        const obj = exResponse as Record<string, any>;
        rawMessage = obj.message || obj.error || "Unknown error";
        if (Array.isArray(rawMessage)) {
          rawMessage = rawMessage[0]?.message || rawMessage[0] || "Validation error";
        }
        errorCode = obj.code || MESSAGE_TO_ERROR_CODE[rawMessage] || STATUS_TO_ERROR_CODE[status] || "INTERNAL_ERROR";
      } else {
        errorCode = STATUS_TO_ERROR_CODE[status] || "INTERNAL_ERROR";
      }

      const userLang = (request as any).user?.lang;
      const acceptLanguage = request.headers['accept-language'];
      const lang = userLang || (acceptLanguage ? acceptLanguage.substring(0, 2) : null) || "ar";
      const translated = this.i18nService.translate("translation.errors." + errorCode, { lang });

      return response.status(status).json({
        statusCode: status,
        errorCode,
        message: translated,
      });
    }

    this.logger.error(
      "Unhandled exception",
      exception instanceof Error ? exception.stack : exception,
    );

    const userLang = (request as any).user?.lang;
    const acceptLanguage = request.headers['accept-language'];
    const lang = userLang || (acceptLanguage ? acceptLanguage.substring(0, 2) : null) || "ar";

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: "INTERNAL_ERROR",
      message: this.i18nService.translate("translation.errors.INTERNAL_ERROR", { lang }),
    });
  }
}
