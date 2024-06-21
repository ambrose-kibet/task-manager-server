import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import {
  PasswordResetTokenPayload,
  VerificationTokenPayload,
} from 'src/utils/types';
import { EmailService } from 'src/email/email.service';
import { UserService } from 'src/user/user.service';
import { v4 as uuid } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) {}

  async initiateEmailVerification(email: string, name: string) {
    const verificationToken = this.generateVerificationToken(email);
    const code = this.generateVerificationCode();
    try {
      await this.saveVerificationToken(verificationToken, email, code);
      await this.emailService.sendVerificationEmail(
        email,
        name,
        verificationToken,
        code,
      );
    } catch (error) {
      throw new BadRequestException('Error sending email');
    }
  }

  async verifyEmail(token: string, code: string) {
    try {
      const { email } = this.jwtService.verify<VerificationTokenPayload>(
        token,
        {
          secret: process.env.JWT_EMAIL_SECRET,
          ignoreExpiration: true,
        },
      );
      const dbToken = await this.findVerificationToken(email);

      if (!dbToken.token || dbToken.token !== token) {
        throw new BadRequestException('Invalid token');
      }
      if (dbToken.code !== code) {
        throw new BadRequestException('invalid verification code');
      }
      const user = await this.userService.findUserByEmail(email);
      if (!user) {
        throw new BadRequestException('Invalid token');
      }
      if (user.isEmailConfirmed) {
        return 'Email already confirmed';
      }

      if (dbToken.expiresAt < new Date()) {
        await this.handleExpiredToken(token, email);
        throw new BadRequestException('Token expired. New token sent');
      }
      await this.userService.markEmailAsConfirmed(user.id);
      await this.deleteVerificationToken(token, email);
      return 'Email confirmed successfully';
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Invalid token');
    }
  }

  generateVerificationToken(email: string) {
    const payload: VerificationTokenPayload = { email };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_EMAIL_SECRET,
      expiresIn: process.env.JWT_EMAIL_EXPIRATION_TIME,
    });
    return token;
  }

  async saveVerificationToken(token: string, email: string, code: string) {
    const savedToken = await this.prisma.verificationToken.create({
      data: {
        token,
        email,
        code,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
    return savedToken;
  }

  async deleteVerificationToken(token: string, email: string) {
    const tokenDb = await this.prisma.verificationToken.findFirst({
      where: {
        token,
        email,
      },
    });
    if (!tokenDb) {
      return;
    }
    const deletedToken = this.prisma.verificationToken.delete({
      where: {
        id: tokenDb.id,
      },
    });
    return deletedToken;
  }

  async findVerificationToken(email: string) {
    const token = await this.prisma.verificationToken.findFirst({
      where: {
        email,
      },
    });
    return token;
  }

  async handleExpiredToken(token: string, email: string) {
    await this.deleteVerificationToken(token, email);
    const verificationToken = this.generateVerificationToken(email);
    const code = this.generateVerificationCode();
    const user = await this.userService.findUserByEmail(email);
    await this.saveVerificationToken(verificationToken, email, code);
    await this.emailService.sendVerificationEmail(
      email,
      user.email,
      verificationToken,
      code,
    );
  }

  async initiatePasswordReset(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('Email does not exist');
    }
    const { token, resetToken } = this.generatePasswordResetToken(email);

    try {
      await this.savePasswordResetToken(email, resetToken);
      await this.emailService.sendPasswordResetEmail(email, user.name, token);
    } catch (error) {
      throw new BadRequestException('Error sending email');
    }
  }

  generatePasswordResetToken(email: string) {
    const resetToken = uuid();
    const token = this.jwtService.sign(
      { email, token: resetToken },
      {
        secret: process.env.JWT_PASSWORD_SECRET,
        expiresIn: process.env.JWT_PASSWORD_EXPIRATION_TIME,
      },
    );
    return { token, resetToken };
  }
  generateVerificationCode() {
    const token = crypto.randomInt(100000, 999999).toString();
    return token;
  }

  async savePasswordResetToken(email: string, token: string) {
    return await this.prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
  }

  async findPasswordResetToken(email: string) {
    return await this.prisma.passwordResetToken.findFirst({
      where: {
        email,
      },
    });
  }

  async deletePasswordResetToken(email: string) {
    const token = await this.prisma.passwordResetToken.findFirst({
      where: {
        email,
      },
    });
    if (!token) {
      return;
    }
    return this.prisma.passwordResetToken.delete({
      where: {
        id: token.id,
      },
    });
  }

  async verifyPasswordResetToken(token: string) {
    try {
      const { email, token: payloadToken } =
        this.jwtService.verify<PasswordResetTokenPayload>(token, {
          secret: process.env.JWT_PASSWORD_SECRET,
          ignoreExpiration: true,
        });

      const dbToken = await this.findPasswordResetToken(email);
      if (!dbToken) {
        throw new UnauthorizedException('Invalid token');
      }
      if (dbToken.expiresAt < new Date()) {
        await this.handleExpiredPasswordResetToken(token, email);
        throw new BadRequestException('Token expired. New token sent');
      }
      if (dbToken.token !== payloadToken) {
        throw new BadRequestException('Invalid token');
      }
      await this.deletePasswordResetToken(email);

      return email;
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }

  async handleExpiredPasswordResetToken(token: string, email: string) {
    await this.deletePasswordResetToken(email);
    const { token: resetToken } = this.generatePasswordResetToken(email);
    const user = await this.userService.findUserByEmail(email);
    await this.savePasswordResetToken(email, resetToken);
    await this.emailService.sendPasswordResetEmail(
      email,
      user.name,
      resetToken,
    );
  }

  async generateAuthToken(userId: string) {
    const payload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_AUTH_TOKEN_SECRET,
      expiresIn: process.env.JWT_AUTH_TOKEN_EXPIRATION_TIME,
    });
    const dbToken = await this.saveAuthToken(token, userId);
    return dbToken.token;
  }

  async saveAuthToken(token: string, userId: string) {
    const existingToken = await this.prisma.authToken.findFirst({
      where: {
        userId,
      },
    });
    if (existingToken) {
      await this.deleteAuthToken(existingToken.id);
    }
    const tokenDb = await this.prisma.authToken.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 2),
      },
    });
    return tokenDb;
  }

  async findAuthToken(token: string, userId: string) {
    const dbToken = await this.prisma.authToken.findFirst({
      where: {
        token,
        userId,
      },
    });
    return dbToken;
  }
  async deleteAuthToken(id: string) {
    const token = await this.prisma.authToken.delete({
      where: {
        id,
      },
    });
    return token;
  }

  async verifyAuthToken(token: string) {
    try {
      const { userId } = this.jwtService.verify<{ userId: string }>(token, {
        secret: process.env.JWT_AUTH_TOKEN_SECRET,
        ignoreExpiration: true,
      });

      const dbToken = await this.findAuthToken(token, userId);
      if (!dbToken) {
        throw new BadRequestException('Invalid token dbToken');
      }

      if (dbToken.expiresAt < new Date()) {
        throw new BadRequestException('Token expired expiredAt');
      }

      if (dbToken.token !== token) {
        throw new BadRequestException('Invalid token  not equal');
      }
      await this.deleteAuthToken(dbToken.id);
      return userId;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Invalid token catch');
    }
  }
}
