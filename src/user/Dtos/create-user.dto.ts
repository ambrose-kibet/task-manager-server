import { Transform } from 'class-transformer';
import {
  IsBoolean,
  isEmail,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'johndoe@mail.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'https://www.example.com/avatar.jpg',
    description: 'The avatar url of the user',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  avatar: string;

  @ApiProperty({
    example: 'Aa@123456',
    description: 'The password of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsBoolean()
  @IsOptional()
  isEmailConfirmed?: boolean;
}
