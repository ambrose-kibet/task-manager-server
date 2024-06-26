import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';

class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  avatar: Express.Multer.File;
}

export default FileUploadDto;
