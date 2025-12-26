import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole, User } from '@prisma/client';
import { Request } from 'express';

interface RequestWithUser extends Request {
  userId?: string;
  user?: User;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const clerkId = request.userId;

    if (!clerkId) {
      return false;
    }

    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return false;
    }

    request.user = user;
    return requiredRoles.includes(user.role);
  }
}
