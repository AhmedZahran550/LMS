import {
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { DBErrorCode } from '../utils/db.errors';
import { ErrorCodes } from '../utils/error-codes';

@Catch(QueryFailedError, EntityNotFoundError)
export class DBExceptionFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: unknown) {
    if (exception instanceof QueryFailedError) {
      const code = (exception as any).code;
      if (!code) {
        throw exception;
      }
      const fieldlastIndex = (exception as any).detail?.indexOf(')');
      let property;
      if ((exception as any).detail && fieldlastIndex !== -1) {
        property = ((exception as any).detail as string).substring(
          5,
          fieldlastIndex,
        );
      }
      switch (code) {
        case DBErrorCode.UNIQUE_VOILATION:
          throw new ConflictException({
            message: 'This value already exists',
            errorCode: 'UNIQUE_VIOLATION',
            errors: [
              {
                property: property ?? undefined,
                code: ErrorCodes.UNIQUE_VOILATION,
                message: 'This value already exists',
              },
            ],
          });
        case DBErrorCode.NOT_NULL_CONSTRAINT:
          throw new BadRequestException({
            message: 'This field is required',
            errorCode: 'BAD_REQUEST',
            errors: [
              {
                property: (exception as any).column ?? property ?? undefined,
                code: ErrorCodes.NOT_NULL_CONSTRAINT,
                message: 'This field is required',
              },
            ],
          });
        case DBErrorCode.CHECK_VOILATION:
          throw new ConflictException({
            message: 'Constraint violation',
            errorCode: 'BAD_REQUEST',
            errors: [
              {
                property: property ?? undefined,
                code: ErrorCodes.UNIQUE_VOILATION,
                message: 'Constraint violation',
              },
            ],
          });
        case DBErrorCode.FORIGN_KEY_VIOLATION:
          const foreignKeyError = this.getForeignkeyViolationError(
            (exception as any).detail,
          );
          throw new ConflictException({
            message: 'Related record not found',
            errorCode: 'CONFLICT',
            errors: foreignKeyError ? [foreignKeyError] : [],
          });
        case DBErrorCode.INVALID_TEXT_REPRESENTATION:
          throw new BadRequestException({
            message: 'Invalid format',
            errorCode: 'INVALID_FORMAT',
            errors: [
              {
                property: property ?? undefined,
                code: ErrorCodes.INVALID_FORMAT,
                message: 'Invalid format',
              },
            ],
          });
      }
      throw exception;
    } else if (exception instanceof EntityNotFoundError) {
      throw new NotFoundException({
        message: 'Resource not found',
        errorCode: ErrorCodes.RESOURCE_NOT_FOUND,
      });
    } else {
      throw exception;
    }
  }

  getForeignkeyViolationError(message: string) {
    const regex = /Key \(([^)]+)\)=\(([^)]+)\)/;
    const matches = message.match(regex);
    if (!matches || matches.length < 2) {
      console.warn('no matches found while error mapping', message);
      return null;
    }
    const key = matches[1];
    const value = matches[2];
    return {
      property: key,
      value,
      code: ErrorCodes.UNIQUE_VOILATION,
      message: 'Related record not found',
    };
  }
}
