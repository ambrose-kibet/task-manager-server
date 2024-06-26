import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyQueryDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.JwtTokenExample.eyJpZCI6IjYxMjM0NTY3ODkwMCIsImlhdCI6MTYxMjM0NTY3OH0',
    description: 'The token for the email verification sent to the user email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: '123456',
    description: 'The code for the email verification sent to the user email',
  })
  @IsNumberString()
  @IsNotEmpty()
  code: string;
}
