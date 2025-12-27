import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DecisorFeedback } from '@prisma/client';

export class SubmitFeedbackDto {
  @ApiProperty({ enum: DecisorFeedback })
  @IsEnum(DecisorFeedback)
  feedback: DecisorFeedback;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
