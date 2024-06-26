import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AllTasksQueryDto {
  @ApiProperty({
    example: '10',
    description: 'The number  page of the tasks to return',
  })
  @IsNumberString({ no_symbols: true })
  @IsNotEmpty({ message: 'page must be a string in query params' })
  page: string;
}
