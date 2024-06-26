import {
  Equals,
  IsNotEmpty,
  IsString,
  MinLength,
  NotEquals,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { PickType } from '@nestjs/mapped-types';
import { IsPasswordMatchConstraint } from 'src/utils/custom-validators/matching-passwords';
import { IsPasswordDifferentFromCurrentConstraint } from 'src/utils/custom-validators/diff-from-curr-pass';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto extends PickType(CreateUserDto, [
  'password',
] as const) {
  @ApiProperty({
    example: 'password',
    description: 'The current password of the user',
  })
  password: string;
  @ApiProperty({
    example: 'Aa@123456',
    description: 'The new password of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @IsPasswordDifferentFromCurrentConstraint({
    message: 'New password must be different from current password',
  })
  newPassword: string;

  @ApiProperty({
    example: 'Aa@123456',
    description: 'The new password confirmation of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @IsPasswordMatchConstraint({
    message: 'Passwords do not match',
  })
  confirmPassword: string;
}
