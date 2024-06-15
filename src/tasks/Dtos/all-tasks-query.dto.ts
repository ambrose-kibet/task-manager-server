import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumberString,
  IsPositive,
  IsNumber,
} from 'class-validator';

export class AllTasksQueryDto {
  @IsNumberString({ no_symbols: true })
  @IsNotEmpty({ message: 'page must be a string in query params' })
  page: string;
}
