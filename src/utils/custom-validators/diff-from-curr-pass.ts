import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UpdatePasswordDto } from 'src/user/Dtos/update-password.dto';

@ValidatorConstraint({ name: 'IsPasswordDifferentFromCurrent', async: false })
export class IsPasswordDifferentFromCurrent
  implements ValidatorConstraintInterface
{
  validate(newPassword: any, args: ValidationArguments) {
    const object = args.object as UpdatePasswordDto;
    return newPassword !== object.password;
  }
}

export function IsPasswordDifferentFromCurrentConstraint(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPasswordDifferentFromCurrent,
    });
  };
}
