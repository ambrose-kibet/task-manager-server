import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'johndoe@mail.com',
    description: 'The email of the user to reset the password',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
