import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

interface RequestWithUserId extends Request {
  userId?: string;
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('CLERK_SECRET_KEY') || '';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUserId>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const result = await verifyToken(token, {
        secretKey: this.secretKey,
      });
      request.userId = result.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
