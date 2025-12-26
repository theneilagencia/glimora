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
import { ActionsService } from './actions.service';
import { CreateActionDto } from './dto/create-action.dto';
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User, ActionStatus } from '@prisma/client';

@ApiTags('actions')
@ApiBearerAuth()
@Controller('actions')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new action' })
  create(@Body() createActionDto: CreateActionDto) {
    return this.actionsService.create(createActionDto);
  }

  @Post('generate/:signalId')
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Generate actions from a signal' })
  generateFromSignal(@Param('signalId') signalId: string) {
    return this.actionsService.generateActionsFromSignal(signalId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all actions' })
  @ApiQuery({ name: 'status', required: false, enum: ActionStatus })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @CurrentUser() user: User,
    @Query('status') status?: ActionStatus,
    @Query('limit') limit?: string,
  ) {
    return this.actionsService.findAll(user.organizationId, {
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending actions for current user' })
  getPendingActions(@CurrentUser() user: User) {
    return this.actionsService.getPendingActions(user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get action statistics' })
  getStats(@CurrentUser() user: User) {
    return this.actionsService.getActionStats(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get action by ID' })
  findOne(@Param('id') id: string) {
    return this.actionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update action' })
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateActionDto>) {
    return this.actionsService.update(id, updateDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update action status' })
  updateStatus(@Param('id') id: string, @Body('status') status: ActionStatus) {
    return this.actionsService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete action' })
  remove(@Param('id') id: string) {
    return this.actionsService.remove(id);
  }
}
