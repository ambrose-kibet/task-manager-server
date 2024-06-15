import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  @IsNotEmpty()
  title: string;

  @MaxLength(250)
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  description: string;
}
