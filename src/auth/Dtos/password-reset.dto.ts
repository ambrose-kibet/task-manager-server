import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class PasswordResetDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
