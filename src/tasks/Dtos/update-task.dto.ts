import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateTaskDto {
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @MaxLength(250)
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
