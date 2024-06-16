import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './Dtos/create-user.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UNIQUENESS_ERROR_CODE } from 'src/utils/prisma-errors';
import { UpdateUserDto } from './Dtos/update-user.dto';
import { UpdatePasswordDto } from './Dtos/update-password.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, Role, User } from '@prisma/client';
import { AuthUser } from 'src/utils/types';
import * as moment from 'moment';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: CreateUserDto) {
    try {
      let hashedPassword: string | null = null;
      if (data.password) {
        hashedPassword = await this.hashPassword(data.password);
      }
      data.password = hashedPassword;
      const user = await this.prisma.user.create({
        data,
      });
      return user;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === UNIQUENESS_ERROR_CODE
      ) {
        throw new BadRequestException('Email already in use');
      }
      throw error;
    }
  }
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async updateUser(id: string, data: UpdateUserDto, authUser: AuthUser) {
    const user = await this.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (authUser.role !== 'ADMIN' && authUser.id !== user.id) {
      throw new ForbiddenException('Unauthorized operation');
    }
    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data,
    });
    return updatedUser;
  }

  async changeUserRole(id: string, role: Role) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        role,
      },
    });
  }
  async updateUserPassword(data: UpdatePasswordDto, authUser: AuthUser) {
    const user = await this.findUserById(authUser.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (authUser.role !== 'ADMIN' && authUser.id !== user.id) {
      throw new ForbiddenException('Unauthorized operation');
    }
    const isMatch = await this.comparePassword(data.newPassword, user.password);
    const isCurrentPasswordMatch = await this.comparePassword(
      data.password,
      user.password,
    );
    if (!isCurrentPasswordMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (isMatch) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const hashedPassword = await this.hashPassword(data.newPassword);
    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return updatedUser;
  }
  async updateUserEmail(email: string, userId: string) {
    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        email,
      },
    });

    return updatedUser;
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const hashedRefreshToken = await this.hashPassword(refreshToken);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.findUserById(userId);
    const isRefreshTokenMatching = await this.comparePassword(
      refreshToken,
      user.refreshToken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  async removeRefreshToken(userId: string) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: null,
      },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany();
  }

  async getSignUpsStats(duration: 'daily' | 'weekly' | 'monthly') {
    const currentDate = moment().startOf('day');
    let startDate: moment.Moment;
    let query: Prisma.Sql;

    if (duration === 'daily') {
      startDate = currentDate.clone().subtract(7, 'days');

      query = Prisma.sql`WITH date_series AS (
        SELECT generate_series(
                 ${startDate.toISOString()}::DATE,
                 ${currentDate.toISOString()}::DATE,
                 INTERVAL '1 day'
               )::DATE AS date
      )
     SELECT 
        TO_CHAR(ds.date, 'YY-MM-DD') AS date,
        COALESCE(SUM(CASE WHEN u."isEmailConfirmed" IS TRUE THEN 1 ELSE 0 END), 0) AS verified,
        COUNT(u.id) AS count
      FROM date_series ds
      LEFT JOIN "User" u ON TO_CHAR(u."createdAt", 'YY-MM-DD') = TO_CHAR(ds.date, 'YY-MM-DD')
      GROUP BY ds.date
      ORDER BY ds.date`;
    } else if (duration === 'weekly') {
      startDate = currentDate.clone().subtract(4, 'weeks');
      query = Prisma.sql`WITH date_series AS (
        SELECT generate_series(
                 ${startDate.toISOString()}::DATE,
                 ${currentDate.toISOString()}::DATE,
                 INTERVAL '1 week'
               )::DATE AS date
      )
      SELECT 
          TO_CHAR(ds.date, 'YY-MM-WW') AS date,
          COALESCE(SUM(CASE WHEN u."isEmailConfirmed" IS TRUE THEN 1 ELSE 0 END), 0) AS verified,
          COUNT(u.id) AS count
      FROM date_series ds
      LEFT JOIN "User" u ON TO_CHAR(u."createdAt", 'YY-MM-WW') = TO_CHAR(ds.date, 'YY-MM-WW')
      GROUP BY ds.date
      ORDER BY ds.date`;
    } else {
      startDate = currentDate.clone().subtract(6, 'months');
      query = Prisma.sql`WITH date_series AS (
        SELECT generate_series(
                 ${startDate.toISOString()}::DATE,
                 ${currentDate.toISOString()}::DATE,
                 INTERVAL '1 month'
               )::DATE AS date
      )
      SELECT 
          TO_CHAR(ds.date, 'YY-MM') AS date,
          COALESCE(SUM(CASE WHEN u."isEmailConfirmed" IS TRUE THEN 1 ELSE 0 END), 0) AS verified,
          COUNT(u.id) AS count
      FROM date_series ds
      LEFT JOIN "User" u ON TO_CHAR(u."createdAt", 'YY-MM') = TO_CHAR(ds.date, 'YY-MM')
      GROUP BY ds.date
      ORDER BY ds.date`;
    }

    const stats: Array<{
      date: string;
      verified: bigint;
      count: bigint;
    }> = await this.prisma.$queryRaw(query);
    return stats.map((stat) => ({
      date: stat.date,
      count: Number(stat.count),
      verified: Number(stat.verified),
    }));
  }
  async markEmailAsConfirmed(userId: string) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isEmailConfirmed: true,
      },
    });
  }
  async updatePasswordWithEmail(email: string, password: string) {
    const hashedPassword = await this.hashPassword(password);
    return this.prisma.user.update({
      where: {
        email,
      },
      data: {
        password: hashedPassword,
      },
    });
  }

  async updateAvatar(userId: string, avatar: string) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatar,
      },
    });
  }

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async comparePassword(candidatePassword: string, hashedPassword: string) {
    const isMatch = await bcrypt.compare(candidatePassword, hashedPassword);
    return isMatch;
  }
}
