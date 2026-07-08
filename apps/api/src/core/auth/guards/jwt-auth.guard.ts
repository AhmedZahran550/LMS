import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      let errorMessage = 'You are not authorized to access this resource. Please log in.';
      
      if (info?.name === 'TokenExpiredError') {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (info?.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid authentication token. Please log in again.';
      }

      throw err || new UnauthorizedException(errorMessage);
    }
    return user;
  }
}
