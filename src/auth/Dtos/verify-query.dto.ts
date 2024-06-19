import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class VerifyQueryDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsNumberString()
  @IsNotEmpty()
  code: string;
}
