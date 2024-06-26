import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogInDto {
  @ApiProperty({
    example: 'johndoe@mail.com',
    description: 'The email of the user to log in',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password',
    description: 'The password of the user to log in',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
