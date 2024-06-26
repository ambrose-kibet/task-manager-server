import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsNumberString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TaskQueryDto {
  @ApiProperty({
    example: 'Task title',
    description:
      'The title of the task to search for in query params (optional)',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'asc',
    description:
      'The sort order of the tasks in query params by CreatedAt (asc or desc)',
  })
  @IsEnum(['asc', 'desc'], {
    message: 'sort must be asc or desc in query params',
  })
  sort: 'asc' | 'desc';

  @ApiProperty({
    example: '10',
    description: 'The number of page of the tasks to return in query params',
  })
  @IsNumberString({ no_symbols: true })
  @IsNotEmpty({ message: 'page must be a string in query params' })
  page: string;

  @ApiProperty({
    example: '2021-01-01',
    description:
      'The date of the tasks to return in query params with format YYYY-MM-DD',
  })
  @IsDateString()
  @IsNotEmpty({
    message: 'date must be a string in query params with format YYYY-MM-DD',
  })
  date: string;
}
