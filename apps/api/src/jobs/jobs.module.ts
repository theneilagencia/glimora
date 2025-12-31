import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { AuthModule } from '../auth/auth.module';
import { ApifyModule } from '../apify/apify.module';
import { DecisorScoreService } from '../decisors/decisor-score.service';

// Check if BullMQ workers should be disabled (to save Redis requests)
const DISABLE_BULLMQ_WORKERS = process.env.DISABLE_BULLMQ_WORKERS === 'true';

// Only import processors if workers are enabled
const conditionalProviders = DISABLE_BULLMQ_WORKERS
  ? []
  : [
      require('./jobs.processor').SignalCollectionProcessor,
      require('./decisor-detection.processor').DecisorDetectionProcessor,
    ];

@Module({
  imports: [
    AuthModule,
    ApifyModule,
    // Only register queues if workers are enabled
    ...(DISABLE_BULLMQ_WORKERS
      ? []
      : [
          BullModule.registerQueue({ name: 'signal-collection' }),
          BullModule.registerQueue({ name: 'decisor-detection' }),
        ]),
  ],
  controllers: [JobsController],
  providers: [JobsService, DecisorScoreService, ...conditionalProviders],
  exports: [JobsService],
})
export class JobsModule {}
