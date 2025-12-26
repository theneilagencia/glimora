import { Module } from '@nestjs/common';
import { DecisorsService } from './decisors.service';
import { DecisorsController } from './decisors.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DecisorsController],
  providers: [DecisorsService],
  exports: [DecisorsService],
})
export class DecisorsModule {}
