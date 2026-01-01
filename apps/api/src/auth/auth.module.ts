import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserContextGuard } from '../common/guards/user-context.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ConfigModule, forwardRef(() => UsersModule)],
  providers: [ClerkAuthGuard, RolesGuard, UserContextGuard],
  exports: [ClerkAuthGuard, RolesGuard, UserContextGuard],
})
export class AuthModule {}
