import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyQueryDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
