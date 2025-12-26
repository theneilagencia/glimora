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
import { CreateDecisorDto } from './dto/create-decisor.dto';
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User } from '@prisma/client';

@ApiTags('decisors')
@ApiBearerAuth()
@Controller('decisors')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class DecisorsController {
  constructor(private readonly decisorsService: DecisorsService) {}

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
}
