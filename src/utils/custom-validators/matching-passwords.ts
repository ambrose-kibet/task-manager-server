import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UpdatePasswordDto } from 'src/user/Dtos/update-password.dto';

@ValidatorConstraint({ name: 'IsPasswordMatch', async: false })
export class IsPasswordMatch implements ValidatorConstraintInterface {
  validate(confirmPassword: any, args: ValidationArguments) {
    const object = args.object as UpdatePasswordDto;
    return confirmPassword === object.newPassword;
  }
}

export function IsPasswordMatchConstraint(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPasswordMatch,
    });
  };
}
