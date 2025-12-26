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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new account' })
  create(
    @CurrentUser() user: User,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountsService.create(user.organizationId, createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['score', 'priority'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @CurrentUser() user: User,
    @Query('sortBy') sortBy?: string,
    @Query('limit') limit?: string,
  ) {
    return this.accountsService.findAll(user.organizationId, {
      sortBy,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('top')
  @ApiOperation({ summary: 'Get top accounts by signal score' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopAccounts(@CurrentUser() user: User, @Query('limit') limit?: string) {
    return this.accountsService.getTopAccounts(
      user.organizationId,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('recent-signals')
  @ApiOperation({ summary: 'Get accounts with recent signals' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getAccountsWithRecentSignals(
    @CurrentUser() user: User,
    @Query('days') days?: string,
  ) {
    return this.accountsService.getAccountsWithRecentSignals(
      user.organizationId,
      days ? parseInt(days, 10) : 7,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update account' })
  update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateAccountDto>,
  ) {
    return this.accountsService.update(id, updateDto);
  }

  @Patch(':id/assign')
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Assign account to user' })
  assignTo(@Param('id') id: string, @Body('userId') userId: string) {
    return this.accountsService.assignTo(id, userId);
  }

  @Delete(':id')
  @Roles(UserRole.EXEC)
  @ApiOperation({ summary: 'Delete account' })
  remove(@Param('id') id: string) {
    return this.accountsService.remove(id);
  }
}
