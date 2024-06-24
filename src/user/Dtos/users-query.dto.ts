import { IsOptional, IsString, IsNumberString, IsEnum } from 'class-validator';

export class UsersQueryDto {
  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNumberString()
  @IsOptional()
  page?: string;

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
