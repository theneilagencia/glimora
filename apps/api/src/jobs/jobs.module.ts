import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { SignalCollectionProcessor } from './jobs.processor';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueue({
      name: 'signal-collection',
    }),
  ],
  controllers: [JobsController],
  providers: [JobsService, SignalCollectionProcessor],
  exports: [JobsService],
})
export class JobsModule {}
