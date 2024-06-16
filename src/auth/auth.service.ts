import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LogInDto } from './Dtos/log-in.dto';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from 'src/utils/types';
import { RegisterUserDto } from './Dtos/register-user.dto';

import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {}

  async register(registrationData: RegisterUserDto) {
    const user = await this.userService.createUser(registrationData);
    await this.tokenService.initiateEmailVerification(user.email, user.name);
    return 'User registered successfully. Please check your email for verification';
  }

  async validateUser(loginData: LogInDto) {
    try {
      const user = await this.userService.findUserByEmail(loginData.email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const isPasswordValid = await this.userService.comparePassword(
        loginData.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (!user.isEmailConfirmed) {
        throw new UnauthorizedException('Email not confirmed');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async verifyEmail(token: string) {
    return await this.tokenService.verifyEmail(token);
  }

  async validateAuthToken(token: string) {
    const userId = await this.tokenService.verifyAuthToken(token);
    if (!userId) {
      throw new BadRequestException('Invalid token');
    }
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('Invalid token');
    }
    return user;
  }

  getCookieWithJwtAccessToken(userId: string) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    });
    const cookie = `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME}; SameSite=None`;
    return cookie;
  }

  getCookieWithJwtRefreshToken(userId: string) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    });
    //you can also set the secure flag to true if you are using https
    // and the sameSite flag to 'None' if you are using cross-origin requests
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME};SameSite=None`;

    return {
      cookie,
      token,
    };
  }
  getLogOutCookies() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }

  async forgotPassword(email: string) {
    await this.tokenService.initiatePasswordReset(email);
    return 'Password reset email sent successfully';
  }

  async resetPassword(token: string, password: string) {
    const email = await this.tokenService.verifyPasswordResetToken(token);
    if (!email) {
      throw new BadRequestException('Invalid or expired token');
    }
    await this.userService.updatePasswordWithEmail(email, password);
    return 'Password reset successfully';
  }
}
