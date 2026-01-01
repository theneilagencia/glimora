import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';

interface RequestWithUser extends Request {
  userId?: string;
  user?: any;
}

@Injectable()
export class UserContextGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.userId;

    if (!userId) {
      throw new UnauthorizedException('No user ID found on request. Ensure ClerkAuthGuard runs first.');
    }

    try {
      const user = await this.usersService.findByClerkId(userId);
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('User not found or could not be verified.');
    }
  }
}
