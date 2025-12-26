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
import { PressService } from './press.service';
import {
  CreatePressReleaseDto,
  GeneratePressReleaseDto,
} from './dto/create-press-release.dto';
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, PressTemplateType } from '@prisma/client';
import type { User } from '@prisma/client';

@ApiTags('press')
@ApiBearerAuth()
@Controller('press')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class PressController {
  constructor(private readonly pressService: PressService) {}

  @Post()
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new press release' })
  create(@CurrentUser() user: User, @Body() createDto: CreatePressReleaseDto) {
    return this.pressService.create(user.organizationId, createDto);
  }

  @Post('generate')
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Generate a press release from template' })
  generate(
    @CurrentUser() user: User,
    @Body() generateDto: GeneratePressReleaseDto,
  ) {
    return this.pressService.generate(user.organizationId, generateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all press releases' })
  @ApiQuery({ name: 'templateType', required: false, enum: PressTemplateType })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @CurrentUser() user: User,
    @Query('templateType') templateType?: PressTemplateType,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    return this.pressService.findAll(user.organizationId, {
      templateType,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get press release statistics' })
  getStats(@CurrentUser() user: User) {
    return this.pressService.getStats(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get press release by ID' })
  findOne(@Param('id') id: string) {
    return this.pressService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.EXEC, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update press release' })
  update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreatePressReleaseDto>,
  ) {
    return this.pressService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.EXEC)
  @ApiOperation({ summary: 'Delete press release' })
  remove(@Param('id') id: string) {
    return this.pressService.remove(id);
  }
}
