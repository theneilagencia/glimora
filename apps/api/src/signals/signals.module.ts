import { Module } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { SignalSyncService } from './signal-sync.service';
import { SignalsController } from './signals.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SignalsController],
  providers: [SignalsService, SignalSyncService],
  exports: [SignalsService, SignalSyncService],
})
export class SignalsModule {}
