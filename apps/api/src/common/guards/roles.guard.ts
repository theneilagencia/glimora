import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';
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

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const clerkId = request.userId;

    if (!clerkId) {
      return false;
    }

    // Always look up the user from the database and attach to request
    // This ensures @CurrentUser() decorator works for all endpoints
    let user = await this.prisma.user.findUnique({
      where: { clerkId },
      include: { organization: true },
    });

    // If user doesn't exist, create them with a new organization
    // This handles first-time login from Clerk
    if (!user) {
      // Create organization and user on first login
      const org = await this.prisma.organization.create({
        data: {
          name: 'My Organization',
        },
      });

      user = await this.prisma.user.create({
        data: {
          clerkId,
          email: `${clerkId}@temp.glimora.app`, // Temporary email, should be updated from Clerk
          role: 'EXEC', // First user gets EXEC role
          organizationId: org.id,
        },
        include: { organization: true },
      });
    }

    request.user = user;

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    // Check if user has required role
    return requiredRoles.includes(user.role);
  }
}
