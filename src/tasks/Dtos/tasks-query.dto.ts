import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsNumberString,
} from 'class-validator';

export class TaskQueryDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsEnum(['asc', 'desc'], {
    message: 'sort must be asc or desc in query params',
  })
  sort: 'asc' | 'desc';

  @IsNumberString({ no_symbols: true })
  @IsNotEmpty({ message: 'page must be a string in query params' })
  page: string;

  @IsDateString()
  @IsNotEmpty({
    message: 'date must be a string in query params with format YYYY-MM-DD',
  })
  date: string;
}
