import { $Enums, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class AuthResponseDto implements User {
  id: string;
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
