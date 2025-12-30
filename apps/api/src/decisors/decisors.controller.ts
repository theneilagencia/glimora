import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DecisorsService } from './decisors.service';
import { DecisorSyncService } from './decisor-sync.service';
import { CreateDecisorDto } from './dto/create-decisor.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, DecisorLabel } from '@prisma/client';
import type { User } from '@prisma/client';

@ApiTags('decisors')
@ApiBearerAuth()
@Controller('decisors')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class DecisorsController {
  constructor(
    private readonly decisorsService: DecisorsService,
    private readonly decisorSyncService: DecisorSyncService,
  ) {}

  @Post()
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new decisor' })
  create(@Body() createDecisorDto: CreateDecisorDto) {
    return this.decisorsService.create(createDecisorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all decisors in organization' })
  findAll(@CurrentUser() user: User) {
    return this.decisorsService.findAllByOrganization(user.organizationId);
  }

  @Get('top')
  @ApiOperation({ summary: 'Get top decisors by engagement score' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopDecisors(@CurrentUser() user: User, @Query('limit') limit?: string) {
    return this.decisorsService.getTopDecisors(
      user.organizationId,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get decisors with recent activity' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getDecisorsWithRecentActivity(
    @CurrentUser() user: User,
    @Query('days') days?: string,
  ) {
    return this.decisorsService.getDecisorsWithRecentActivity(
      user.organizationId,
      days ? parseInt(days, 10) : 7,
    );
  }

  @Get('account/:accountId')
  @ApiOperation({ summary: 'Get decisors by account' })
  findByAccount(@Param('accountId') accountId: string) {
    return this.decisorsService.findAll(accountId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get decisor statistics for organization' })
  getStats(@CurrentUser() user: User) {
    return this.decisorsService.getDecisorStats(user.organizationId);
  }

  @Get('by-label/:label')
  @ApiOperation({ summary: 'Get decisors by label' })
  getByLabel(@CurrentUser() user: User, @Param('label') label: DecisorLabel) {
    return this.decisorsService.getDecisorsByLabel(user.organizationId, label);
  }

  @Get('top-by-score')
  @ApiOperation({ summary: 'Get top decisors by decisor score' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopByScore(@CurrentUser() user: User, @Query('limit') limit?: string) {
    return this.decisorsService.getTopDecisorsByScore(
      user.organizationId,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Delete('admin/cleanup-mock')
  @Roles(UserRole.EXEC)
  @ApiOperation({ summary: 'Delete mock decisors with fake LinkedIn URLs' })
  cleanupMockDecisors(@CurrentUser() user: User) {
    return this.decisorsService.deleteMockDecisors(user.organizationId);
  }

  @Delete('account/:accountId/all')
  @Roles(UserRole.EXEC)
  @ApiOperation({ summary: 'Delete all decisors for an account (for fresh re-scrape)' })
  deleteAllForAccount(@Param('accountId') accountId: string) {
    return this.decisorsService.deleteAllDecisorsForAccount(accountId);
  }

  @Post('account/:accountId/sync')
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ 
    summary: 'Sync decisors for an account (bypasses job queue)',
    description: 'Synchronously fetches employees from LinkedIn via Apify and updates decisors. This endpoint bypasses the Redis job queue and runs directly. May take 1-5 minutes to complete.',
  })
  syncDecisorsForAccount(@Param('accountId') accountId: string) {
    return this.decisorSyncService.syncDecisorsForAccount(accountId);
  }

  @Post('sync')
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ 
    summary: 'Sync decisors for all accounts in organization (bypasses job queue)',
    description: 'Synchronously fetches employees from LinkedIn via Apify for all accounts with LinkedIn URLs. This endpoint bypasses the Redis job queue and runs directly. May take several minutes to complete depending on the number of accounts.',
  })
  syncDecisorsForOrganization(@CurrentUser() user: User) {
    return this.decisorSyncService.syncDecisorsForOrganization(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get decisor by ID' })
  findOne(@Param('id') id: string) {
    return this.decisorsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update decisor' })
  update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateDecisorDto>,
  ) {
    return this.decisorsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete decisor' })
  remove(@Param('id') id: string) {
    return this.decisorsService.remove(id);
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Submit seller feedback for decisor' })
  submitFeedback(
    @Param('id') id: string,
    @Body() feedbackDto: SubmitFeedbackDto,
    @CurrentUser() user: User,
  ) {
    return this.decisorsService.submitFeedback(
      id,
      feedbackDto.feedback,
      feedbackDto.notes,
      user.id,
    );
  }
}
