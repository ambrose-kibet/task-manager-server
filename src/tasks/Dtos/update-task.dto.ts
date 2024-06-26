import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiProperty({
    example: 'Task title',
    description: 'The title of the task(optional)',
    required: false,
  })
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'Task description',
    description: 'The description of the task(optional)',
    required: false,
  })
  @MaxLength(250)
  @MinLength(10)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'true',
    description: 'The status of the task completion (optional)',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
