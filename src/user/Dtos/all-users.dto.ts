import { $Enums, User } from '@prisma/client';
import { Exclude, Transform } from 'class-transformer';

export class AllUsersResponseDto implements User {
  id: string;

  @Transform(({ value }) => `${value.charAt(0)}****@${value.split('@')[1]}`)
  email: string;

  name: string;
  role: $Enums.Role;
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
