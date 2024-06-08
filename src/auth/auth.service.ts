import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/Dtos/create-user.dto';
import { UserService } from 'src/user/user.service';
import { LogInDto } from './Dtos/log-in.dto';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { TokenPayload, VerificationTokenPayload } from 'src/utils/types';
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
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async verifyEmail(token: string) {
    return await this.tokenService.verifyEmail(token);
  }

  getCookieWithJwtAccessToken(userId: string) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    });
    const cookie = `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME}`;
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
    //change the path to auth/refresh if you are using a different path so that the cookie is sent to the correct path
    // and that its not sent to every request
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME}`;
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
    return await this.tokenService.initiatePasswordReset(email);
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
