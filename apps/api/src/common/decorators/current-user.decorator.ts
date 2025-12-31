import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { User } from '@prisma/client';

interface RequestWithUser {
  user?: User;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    
    if (!request.user) {
      throw new UnauthorizedException('User context not available. Please ensure you are authenticated.');
    }
    
    return request.user;
  },
);
