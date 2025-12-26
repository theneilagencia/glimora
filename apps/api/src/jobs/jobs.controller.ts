import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';

@ApiTags('jobs')
@ApiBearerAuth()
@Controller('jobs')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('collect-signals')
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Trigger signal collection job' })
  scheduleSignalCollection(
    @CurrentUser() user: User,
    @Body('accountId') accountId?: string,
  ) {
    return this.jobsService.scheduleSignalCollection(
      user.organizationId,
      accountId,
    );
  }

  @Post('schedule-weekly')
  @Roles(UserRole.EXEC)
  @ApiOperation({ summary: 'Schedule weekly signal collection' })
  scheduleWeeklyCollection(@CurrentUser() user: User) {
    return this.jobsService.scheduleWeeklyCollection(user.organizationId);
  }

  @Get('logs')
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get job logs' })
  @ApiQuery({ name: 'jobName', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getJobLogs(
    @Query('jobName') jobName?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    return this.jobsService.getJobLogs({
      jobName,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('stats')
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get job statistics' })
  getJobStats() {
    return this.jobsService.getJobStats();
  }

  @Get('queue-status')
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get queue status' })
  getQueueStatus() {
    return this.jobsService.getQueueStatus();
  }
}
