import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SignalsService } from './signals.service';
import { CreateSignalDto } from './dto/create-signal.dto';
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User, SignalType } from '@prisma/client';

@ApiTags('signals')
@ApiBearerAuth()
@Controller('signals')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Post()
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new signal' })
  create(@Body() createSignalDto: CreateSignalDto) {
    const score = this.signalsService.calculateScore(createSignalDto);
    return this.signalsService.create({ ...createSignalDto, score });
  }

  @Get()
  @ApiOperation({ summary: 'Get all signals' })
  @ApiQuery({ name: 'type', required: false, enum: SignalType })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'days', required: false, type: Number })
  findAll(
    @CurrentUser() user: User,
    @Query('type') type?: SignalType,
    @Query('limit') limit?: string,
    @Query('days') days?: string,
  ) {
    return this.signalsService.findAll(user.organizationId, {
      type,
      limit: limit ? parseInt(limit, 10) : undefined,
      days: days ? parseInt(days, 10) : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get signal statistics' })
  getStats(@CurrentUser() user: User) {
    return this.signalsService.getSignalStats(user.organizationId);
  }

  @Get('account/:accountId')
  @ApiOperation({ summary: 'Get signals by account' })
  findByAccount(@Param('accountId') accountId: string) {
    return this.signalsService.findByAccount(accountId);
  }

  @Get('decisor/:decisorId')
  @ApiOperation({ summary: 'Get signals by decisor' })
  findByDecisor(@Param('decisorId') decisorId: string) {
    return this.signalsService.findByDecisor(decisorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get signal by ID' })
  findOne(@Param('id') id: string) {
    return this.signalsService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete signal' })
  remove(@Param('id') id: string) {
    return this.signalsService.remove(id);
  }
}
