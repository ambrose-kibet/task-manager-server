import { IsOptional, IsString, IsNumberString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UsersQueryDto {
  @ApiProperty({
    example: 'johndoe@mail.com',
    description: 'The email of the user to search(optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '2',
    description: 'The page number to get the users(optional)',
    required: false,
  })
  @IsString()
  @IsNumberString()
  @IsOptional()
  page?: string;

  @ApiProperty({
    example: 'email asc',
    description:
      'The sort order of the users(optional)(email asc, email desc, role asc, role desc, createdAt asc, createdAt desc)',
    required: false,
  })
  @IsEnum(
    [
      'email asc',
      'email desc',
      'role asc',
      'role desc',
      'createdAt asc',
      'createdAt desc',
    ],
    {
      message: 'Sort by must be a valid value',
    },
  )
  @IsOptional()
  sortby?:
    | 'email asc'
    | 'email desc'
    | 'role asc'
    | 'role desc'
    | 'createdAt asc'
    | 'createdAt desc';
}
