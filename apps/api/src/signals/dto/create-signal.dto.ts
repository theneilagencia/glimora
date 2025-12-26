import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsUrl,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SignalType, SignalStrength } from '@prisma/client';

export class CreateSignalDto {
  @ApiProperty({ enum: SignalType })
  @IsEnum(SignalType)
  type: SignalType;

  @ApiPropertyOptional({ enum: SignalStrength })
  @IsOptional()
  @IsEnum(SignalStrength)
  strength?: SignalStrength;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  score?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  decisorId?: string;
}
