import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Task title',
    description: 'The title of the task',
  })
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Task description',
    description: 'The description of the task',
  })
  @MaxLength(250)
  @MinLength(10)
  @IsString()
  @IsNotEmpty()
  description: string;
}
