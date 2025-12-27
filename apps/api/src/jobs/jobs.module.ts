import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { SignalCollectionProcessor } from './jobs.processor';
import { DecisorDetectionProcessor } from './decisor-detection.processor';
import { AuthModule } from '../auth/auth.module';
import { ApifyModule } from '../apify/apify.module';
import { DecisorScoreService } from '../decisors/decisor-score.service';

@Module({
  imports: [
    AuthModule,
    ApifyModule,
    BullModule.registerQueue({
      name: 'signal-collection',
    }),
    BullModule.registerQueue({
      name: 'decisor-detection',
    }),
  ],
  controllers: [JobsController],
  providers: [
    JobsService,
    SignalCollectionProcessor,
    DecisorDetectionProcessor,
    DecisorScoreService,
  ],
  exports: [JobsService],
})
export class JobsModule {}
