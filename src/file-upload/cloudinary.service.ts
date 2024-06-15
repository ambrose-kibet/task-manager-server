import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    v2.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadSingleImageFile(file: Express.Multer.File) {
    try {
      const b64 = file.buffer.toString('base64');
      const response = await v2.uploader.upload(
        `data:${file.mimetype};base64,${b64}`,
        {
          folder: 'nest-starter',
          use_filename: true,
        },
      );
      return response.secure_url;
    } catch (error) {
      const err = error as UploadApiErrorResponse;
      throw new Error(err.message || 'Error uploading file');
    }
  }

  async deleteFile(publicId: string) {
    await v2.uploader.destroy(publicId);
  }

  async uploadMultipleImageFiles(files: Express.Multer.File[]) {
    const promises = files.map((file) => this.uploadSingleImageFile(file));
    return await Promise.all(promises);
  }
}
