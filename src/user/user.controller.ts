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
import { AllUsersResponseDto, UsersResponseDto } from './Dtos/all-users.dto';
import { UpdatePasswordDto } from './Dtos/update-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomUploadFileTypeValidator } from 'src/utils/custom-validators/custom-fileType-validator';
import { CloudinaryService } from 'src/file-upload/cloudinary.service';
import { UsersQueryDto } from './Dtos/users-query.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiExcludeEndpoint,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import FileUploadDto from './Dtos/file-upload.dto';

@Controller('users')
@ApiTags('Users')
@UseGuards(JwtAuthenticationGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly fileService: CloudinaryService,
  ) {}

  @Patch('update-password')
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
  })
  @ApiBody({ type: UpdatePasswordDto })
  @HttpCode(200)
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
  @ApiResponse({
    status: 204,
    description: 'User updated',
    type: AuthResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateUserDto })
  @HttpCode(204)
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
  @ApiResponse({
    status: 200,
    description: 'Avatar updated successfully',
    type: AuthResponseDto,
  })
  @SerializeData(AuthResponseDto)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'A new avatar for the user',
    type: FileUploadDto,
  })
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
  @ApiResponse({
    status: 200,
    description: 'User details',
    type: AuthResponseDto,
  })
  @SerializeData(AuthResponseDto)
  getUser(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'All users',
    type: UsersResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @SerializeData(UsersResponseDto)
  @UseGuards(RoleGuard(Role.ADMIN))
  async getAllUsers(@Query() query: UsersQueryDto) {
    return await this.userService.getAllUsers({
      ...query,
      page: query.page ? Number(query.page) : 1,
    });
  }

  @Patch(':id/change-role')
  @ApiResponse({
    status: 204,
    description: 'Role changed',
    type: AuthResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiParam({ name: 'id', type: 'string' })
  @HttpCode(204)
  @SerializeData(AuthResponseDto)
  @UseGuards(RoleGuard(Role.ADMIN))
  async changeRole(@Param('id') id: string, @Body('role') role: Role) {
    return await this.userService.changeUserRole(id, role);
  }

  @Get('signup-stats')
  @ApiResponse({
    status: 200,
    description: 'Get sign up stats',
  })
  @ApiQuery({
    name: 'duration',
    enum: ['daily', 'weekly', 'monthly'],
  })
  @UseGuards(RoleGuard(Role.ADMIN))
  async getSignupStats(
    @Query('duration') duration: 'daily' | 'weekly' | 'monthly',
  ) {
    return await this.userService.getSignUpsStats(duration);
  }
}
