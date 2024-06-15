import { FileValidator } from '@nestjs/common';
import * as fileType from 'file-type-mime';

export interface CustomFileTypeValidatorOptions {
  fileType: string[];
}
export class CustomUploadFileTypeValidator extends FileValidator {
  private _allowedMimeTypes: string[];

  constructor(
    protected readonly validationOptions: CustomFileTypeValidatorOptions,
  ) {
    super(validationOptions);
    this._allowedMimeTypes = this.validationOptions.fileType;
  }

  public isValid(file?: Express.Multer.File): boolean {
    const response = fileType.parse(file.buffer);
    return this._allowedMimeTypes.includes(response.mime);
  }

  public buildErrorMessage(): string {
    return ` Upload only files of type: ${this._allowedMimeTypes.join(', ')}`;
  }
}
