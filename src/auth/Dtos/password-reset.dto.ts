import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetDto {
  @ApiProperty({
    example: '27527GF*asd',
    description: 'The new password for the user',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: '27527GF*asd',
    description: 'The token for the password reset sent to the user email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
