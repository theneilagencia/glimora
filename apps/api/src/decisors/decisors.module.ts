import { Module } from '@nestjs/common';
import { DecisorsService } from './decisors.service';
import { DecisorsController } from './decisors.controller';
import { DecisorSyncService } from './decisor-sync.service';
import { DecisorScoreService } from './decisor-score.service';
import { AuthModule } from '../auth/auth.module';
import { ApifyModule } from '../apify/apify.module';

@Module({
  imports: [AuthModule, ApifyModule],
  controllers: [DecisorsController],
  providers: [DecisorsService, DecisorSyncService, DecisorScoreService],
  exports: [DecisorsService, DecisorSyncService],
})
export class DecisorsModule {}
