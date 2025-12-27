import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { AccountsModule } from './accounts/accounts.module';
import { DecisorsModule } from './decisors/decisors.module';
import { SignalsModule } from './signals/signals.module';
import { ActionsModule } from './actions/actions.module';
import { AuthorityModule } from './authority/authority.module';
import { PressModule } from './press/press.module';
import { JobsModule } from './jobs/jobs.module';
import { BillingModule } from './billing/billing.module';

// Redis connection configuration with Upstash TLS support
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisPassword = process.env.REDIS_PASSWORD;

// Enable TLS for Upstash or when explicitly configured
const useTls =
  process.env.REDIS_TLS === 'true' || redisHost.includes('upstash.io');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        ...(useTls ? { tls: {} } : {}),
        maxRetriesPerRequest: null,
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    AccountsModule,
    DecisorsModule,
    SignalsModule,
    ActionsModule,
    AuthorityModule,
    PressModule,
    JobsModule,
    BillingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
