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
import { AuthorityService } from './authority.service';
import { CreateAuthorityContentDto } from './dto/create-authority-content.dto';
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User } from '@prisma/client';

@ApiTags('authority')
@ApiBearerAuth()
@Controller('authority')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class AuthorityController {
  constructor(private readonly authorityService: AuthorityService) {}

  @Post()
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create new authority content' })
  create(
    @CurrentUser() user: User,
    @Body() createDto: CreateAuthorityContentDto,
  ) {
    return this.authorityService.create(user.organizationId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all authority content' })
  @ApiQuery({
    name: 'topics',
    required: false,
    type: String,
    description: 'Comma-separated topics',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @CurrentUser() user: User,
    @Query('topics') topics?: string,
    @Query('limit') limit?: string,
  ) {
    return this.authorityService.findAll(user.organizationId, {
      topics: topics ? topics.split(',') : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('top')
  @ApiOperation({ summary: 'Get top authority content by engagement' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopContent(@CurrentUser() user: User, @Query('limit') limit?: string) {
    return this.authorityService.getTopContent(
      user.organizationId,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('topics')
  @ApiOperation({ summary: 'Get all topics' })
  getAllTopics(@CurrentUser() user: User) {
    return this.authorityService.getAllTopics(user.organizationId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get authority content statistics' })
  getStats(@CurrentUser() user: User) {
    return this.authorityService.getStats(user.organizationId);
  }

  @Get('match')
  @ApiOperation({ summary: 'Match content to signal topics' })
  @ApiQuery({
    name: 'topics',
    required: true,
    type: String,
    description: 'Comma-separated topics',
  })
  matchToSignal(@CurrentUser() user: User, @Query('topics') topics: string) {
    return this.authorityService.matchContentToSignal(
      user.organizationId,
      topics.split(','),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get authority content by ID' })
  findOne(@Param('id') id: string) {
    return this.authorityService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update authority content' })
  update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateAuthorityContentDto>,
  ) {
    return this.authorityService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.EXEC)
  @ApiOperation({ summary: 'Delete authority content' })
  remove(@Param('id') id: string) {
    return this.authorityService.remove(id);
  }
}
