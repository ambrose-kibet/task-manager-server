import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/Dtos/create-user.dto';
import { LogInDto } from './Dtos/log-in.dto';
import { LocalAuthenticationGuard } from './guards/local-auth.guard';
import { RequestWithUser } from './request-with-user.interface';
import { Response } from 'express';
import {
  SerializeData,
  TransformDataInterceptor,
} from 'src/utils/interceptors/transfrom-data.interceptor';
import { AuthResponseDto } from './Dtos/auth-response.dto';
import JwtRefreshGuard from './guards/jwt-refresh.guard';
import JwtAuthenticationGuard from './guards/jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { GoogleOauthGuard } from './guards/google-auth.guard';
import { GithubOauthGuard } from './guards/github-auth.guard';
import { RegisterUserDto } from './Dtos/register-user.dto';
import { VerifyQueryDto } from './Dtos/verify-query.dto';
import { ForgotPasswordDto } from './Dtos/forgot-password.dto';
import { PasswordResetDto } from './Dtos/password-reset.dto';
import { TokenService } from './token.service';
import { AuthTokenDto } from './Dtos/auth-token.dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() registrationData: RegisterUserDto) {
    return this.authService.register(registrationData);
  }

  @Get('verify')
  async verify(@Query() query: VerifyQueryDto) {
    return this.authService.verifyEmail(query.token);
  }

  @Post('login')
  @HttpCode(200)
  @SerializeData(AuthResponseDto)
  @UseGuards(LocalAuthenticationGuard)
  async login(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) res: Response, // REMEMBER USE THIS TO BE PLATFORM AGNOSTIC?
  ) {
    const { user } = request;
    const accessToken = this.authService.getCookieWithJwtAccessToken(user.id);
    const refreshToken = this.authService.getCookieWithJwtRefreshToken(user.id);
    await this.userService.setCurrentRefreshToken(refreshToken.token, user.id);
    res.setHeader('Set-Cookie', [accessToken, refreshToken.cookie]);
    return user;
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  googleLogin() {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleLoginCallback(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user } = request;
    const authToken = await this.tokenService.generateAuthToken(user.id);
    res.redirect(`${process.env.CLIENT_URL}/auth?token=${authToken}`);
  }

  @Get('github')
  @UseGuards(GithubOauthGuard)
  githubLogin() {
    // Initiates the Github OAuth2 login flow
  }

  @Get('github/callback')
  @UseGuards(GithubOauthGuard)
  async githubLoginCallback(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user } = request;
    const authToken = await this.tokenService.generateAuthToken(user.id);
    res.redirect(`${process.env.CLIENT_URL}/auth?token=${authToken}`);
  }

  @Post('validate-auth-token')
  @SerializeData(AuthResponseDto)
  async validateAuthToken(
    @Body() body: AuthTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateAuthToken(body.token);
    const accessToken = this.authService.getCookieWithJwtAccessToken(user.id);
    const refreshToken = this.authService.getCookieWithJwtRefreshToken(user.id);
    await this.userService.setCurrentRefreshToken(refreshToken.token, user.id);
    res.setHeader('Set-Cookie', [accessToken, refreshToken.cookie]);
    return user;
  }

  @Get('refresh')
  @SerializeData(AuthResponseDto)
  @UseGuards(JwtRefreshGuard)
  refresh(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      request.user.id,
    );
    res.setHeader('Set-Cookie', accessTokenCookie);
    return request.user;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return await this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: PasswordResetDto) {
    return await this.authService.resetPassword(body.token, body.password);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Delete('log-out')
  @HttpCode(200)
  async logOut(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.userService.removeRefreshToken(request.user.id);
    const cookies = this.authService.getLogOutCookies();
    res.setHeader('Set-Cookie', cookies);
    return 'Log out successful';
  }
}
