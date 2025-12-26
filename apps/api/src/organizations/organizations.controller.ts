import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@ApiTags('organizations')
@ApiBearerAuth()
@Controller('organizations')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current organization' })
  findCurrent(@CurrentUser() user: User) {
    return this.organizationsService.findOne(user.organizationId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get organization statistics' })
  getStats(@CurrentUser() user: User) {
    return this.organizationsService.getStats(user.organizationId);
  }

  @Patch('current')
  @Roles(UserRole.EXEC)
  @ApiOperation({ summary: 'Update current organization' })
  update(
    @CurrentUser() user: User,
    @Body() updateDto: Partial<CreateOrganizationDto>,
  ) {
    return this.organizationsService.update(user.organizationId, updateDto);
  }
}
