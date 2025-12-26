import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PressTemplateType } from '@prisma/client';

export class CreatePressReleaseDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ enum: PressTemplateType })
  @IsEnum(PressTemplateType)
  templateType: PressTemplateType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  signalContext?: Record<string, unknown>;
}

export class GeneratePressReleaseDto {
  @ApiProperty({ enum: PressTemplateType })
  @IsEnum(PressTemplateType)
  templateType: PressTemplateType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signalId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ceoName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  partnerName?: string;
}
