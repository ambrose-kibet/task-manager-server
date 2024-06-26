import { $Enums, User } from '@prisma/client';
import { Exclude, Transform, plainToClass } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AllUsersResponseDto implements User {
  @ApiProperty({
    example: '1',
    description: 'The id of the user',
  })
  id: string;

  @ApiProperty({
    example: 'johndoe@mail.com',
    description: 'The email of the user',
  })
  @Transform(({ value }) => `${value.charAt(0)}****@${value.split('@')[1]}`)
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
  })
  @Transform(
    ({ value }) =>
      `${value.charAt(0)}**** ${value.split(' ')[1].charAt(0)}****`,
  )
  name: string;

  @ApiProperty({
    example: 'USER',
    description: 'The role of the user(ADMIN, USER)',
  })
  role: $Enums.Role;

  @ApiProperty({
    example: 'https://www.example.com/avatar.jpg',
    description: 'The avatar url of the user',
  })
  avatar: string;

  @Exclude()
  refreshToken: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  isEmailConfirmed: boolean;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  password: string;
}

export class UsersResponseDto {
  @ApiProperty({
    example: '1',
    description: 'The id of the user',
  })
  total: number;

  @ApiProperty({
    type: [AllUsersResponseDto],
    description: 'The list of users',
  })
  @Transform(({ value }) => {
    return value.map((user: User) => plainToClass(AllUsersResponseDto, user));
  })
  users: AllUsersResponseDto[];
}
