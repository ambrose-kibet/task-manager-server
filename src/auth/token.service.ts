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
    try {
      await this.saveVerificationToken(verificationToken, email);
      await this.emailService.sendVerificationEmail(
        email,
        name,
        verificationToken,
      );
    } catch (error) {
      throw new BadRequestException('Error sending email');
    }
  }

  async verifyEmail(token: string) {
    try {
      const { email } = this.jwtService.verify<VerificationTokenPayload>(
        token,
        {
          secret: process.env.JWT_EMAIL_SECRET,
        },
      );
      const dbToken = await this.findVerificationToken(email);
      if (!dbToken) {
        throw new UnauthorizedException('Invalid token');
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
      await this.deleteVerificationToken(token, email);
      await this.userService.markEmailAsConfirmed(email);
      return 'Email confirmed successfully';
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        const { email } = this.jwtService.verify<VerificationTokenPayload>(
          token,
          {
            secret: process.env.JWT_EMAIL_SECRET,
            ignoreExpiration: true,
          },
        );
        await this.handleExpiredToken(token, email);
        throw new BadRequestException('Token expired. New token sent');
      }
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

  saveVerificationToken(token: string, email: string) {
    return this.prisma.verificationToken.create({
      data: {
        token,
        email,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
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
    return this.prisma.verificationToken.delete({
      where: {
        id: tokenDb.id,
      },
    });
  }

  findVerificationToken(email: string) {
    return this.prisma.verificationToken.findFirst({
      where: {
        email,
      },
    });
  }

  async handleExpiredToken(token: string, email: string) {
    await this.deleteVerificationToken(token, email);
    const verificationToken = this.generateVerificationToken(email);
    const user = await this.userService.findUserByEmail(email);
    await this.saveVerificationToken(verificationToken, email);
    await this.emailService.sendVerificationEmail(
      email,
      user.email,
      verificationToken,
    );
  }

  async initiatePasswordReset(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
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

  async savePasswordResetToken(email: string, token: string) {
    return this.prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
  }

  async findPasswordResetToken(email: string) {
    return this.prisma.passwordResetToken.findFirst({
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
      if (error instanceof TokenExpiredError) {
        const { email } = this.jwtService.verify<VerificationTokenPayload>(
          token,
          {
            secret: process.env.JWT_PASSWORD_SECRET,
            ignoreExpiration: true,
          },
        );
        await this.handleExpiredPasswordResetToken(token, email);
        throw new BadRequestException('Token expired. New token sent');
      }
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
}
