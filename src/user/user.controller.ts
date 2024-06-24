import {
  Body,
  Controller,
  Param,
  Patch,
  ClassSerializerInterceptor,
  UseInterceptors,
  Get,
  UseGuards,
  Req,
  Post,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './Dtos/update-user.dto';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-auth.guard';
import { SerializeData } from 'src/utils/interceptors/transfrom-data.interceptor';
import { AuthResponseDto } from 'src/auth/Dtos/auth-response.dto';
import RoleGuard from 'src/auth/guards/role.guard';
import { Role } from '@prisma/client';
import { RequestWithUser } from 'src/auth/request-with-user.interface';
import { AllUsersResponseDto } from './Dtos/all-users.dto';
import { UpdatePasswordDto } from './Dtos/update-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomUploadFileTypeValidator } from 'src/utils/custom-validators/custom-fileType-validator';
import { CloudinaryService } from 'src/file-upload/cloudinary.service';
import { UsersQueryDto } from './Dtos/users-query.dto';

@Controller('users')
@UseGuards(JwtAuthenticationGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly fileService: CloudinaryService,
  ) {}

  @Patch('update-password')
  @HttpCode(200)
  @SerializeData(AuthResponseDto)
  async updatePassword(
    @Req() req: RequestWithUser,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const updatedUser = await this.userService.updateUserPassword(
      updatePasswordDto,
      req.user,
    );
    return 'Password updated successfully';
  }

  @Patch(':id')
  @SerializeData(AuthResponseDto)
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.userService.updateUser(
      id,
      updateUserDto,
      req.user,
    );
    return updatedUser;
  }

  @Post('update-avatar')
  @SerializeData(AuthResponseDto)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @Req() req: RequestWithUser,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new CustomUploadFileTypeValidator({
            fileType: [
              'image/jpeg',
              'image/png',
              'image/jpg',
              'image/svg',
              'image/webp',
            ],
          }),
        )
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 2 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    const url = await this.fileService.uploadSingleImageFile(file);
    const updatedUser = await this.userService.updateAvatar(req.user.id, url);
    return updatedUser;
  }

  @Get('me')
  @SerializeData(AuthResponseDto)
  getUser(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Get()
  @SerializeData(AllUsersResponseDto)
  @UseGuards(RoleGuard(Role.ADMIN))
  async getAllUsers(@Query() query: UsersQueryDto) {
    return await this.userService.getAllUsers({
      ...query,
      page: query.page ? Number(query.page) : 1,
    });
  }

  @Patch(':id/change-role')
  @SerializeData(AuthResponseDto)
  @UseGuards(RoleGuard(Role.ADMIN))
  async changeRole(@Param('id') id: string, @Body('role') role: Role) {
    return await this.userService.changeUserRole(id, role);
  }

  @Get('signup-stats')
  @UseGuards(RoleGuard(Role.ADMIN))
  async getSignupStats(
    @Query('duration') duration: 'daily' | 'weekly' | 'monthly',
  ) {
    return await this.userService.getSignUpsStats(duration);
  }
}
