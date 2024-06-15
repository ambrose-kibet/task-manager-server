import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateTaskDto } from './Dtos/create-task.dto';
import { AuthUser, TaskPerDay, TasksByDate } from 'src/utils/types';
import { UpdateTaskDto } from './Dtos/update-task.dto';
import { Prisma } from '@prisma/client';
import { calculateLongestStreak } from 'src/utils/helpers';
import * as moment from 'moment';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async createTask(data: CreateTaskDto, userId: string) {
    const task = await this.prisma.task.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });
    return task;
  }

  async getMyTasks(userId: string, page: number) {
    const pageLimit = 10;
    const tasks: TasksByDate[] = await this.prisma.$queryRaw`
        SELECT
            date_trunc('day', created_at) as date,
            JSON_AGG(json_build_object('id', id, 'title', title)) as tasks
        FROM (
            SELECT
                id,
                title,
                created_at
            FROM
                tasks
            WHERE
                user_id = ${userId}
            ORDER BY
                created_at ASC
            LIMIT
                3
        ) t
        GROUP BY
            date
        ORDER BY
            date DESC
        LIMIT
            ${pageLimit}
        OFFSET
            ${(page - 1) * pageLimit} 
    `;
    const count = await this.prisma.$queryRaw`
        SELECT
            COUNT(DISTINCT date_trunc('day', created_at)) as count
        FROM
            tasks
        WHERE
            user_id = ${userId}
    `;

    return { tasks, count: Number(count[0].count) };
  }

  async getMyTasksPerDay({
    userId,
    date,
    title,
    sort,
    page,
  }: {
    userId: string;
    date: string;
    title?: string;
    sort: 'asc' | 'desc';
    page: number;
  }): Promise<{ tasks: TaskPerDay[]; count: number }> {
    const limit = 10;
    const offset = (page - 1) * limit;

    const titleCondition = title
      ? Prisma.sql`AND title ILIKE ${`%${title}%`}`
      : Prisma.sql``;

    // Validate and sanitize the sort variable
    const allowedSortValues = ['ASC', 'DESC'];
    const sanitizedSort = allowedSortValues.includes(sort.toUpperCase())
      ? sort.toUpperCase()
      : 'ASC';

    const query = Prisma.sql`
        SELECT
            id,
            title,
            description,
            is_completed AS "isCompleted",
            created_at AS "createdAt"
        FROM
            tasks
        WHERE
            user_id = ${userId} AND
            date_trunc('day', created_at) = date_trunc('day', ${date}::timestamp)
            ${titleCondition}
        ORDER BY
            created_at ${Prisma.sql([sanitizedSort])}
        LIMIT 
            ${limit}
        OFFSET 
            ${offset}
        `;

    const countQuery = Prisma.sql`
        SELECT
            COUNT(*)
        FROM
            tasks
        WHERE
            user_id = ${userId} AND
            date_trunc('day', created_at) = date_trunc('day', ${date}::timestamp)
            ${titleCondition}
        `;
    const tasks = await this.prisma.$queryRaw<TaskPerDay[]>(query);
    const count = await this.prisma.$queryRaw<{ count: number }>(countQuery);

    return { tasks, count: Number(count[0].count) };
  }

  async getTaskById(id: number, user: AuthUser) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (task.userId !== user.id) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async updateTask(id: number, data: UpdateTaskDto, user: AuthUser) {
    const task = await this.getTaskById(id, user);
    let isCompleted: Date | null;

    if (data.isCompleted !== undefined) {
      if (task.isCompleted && data.isCompleted) {
        isCompleted = task.isCompleted;
      } else if (!task.isCompleted && !data.isCompleted) {
        isCompleted = task.isCompleted;
      } else if (!task.isCompleted && data.isCompleted) {
        isCompleted = new Date();
      } else {
        isCompleted = null;
      }
    } else {
      isCompleted = task.isCompleted;
    }

    const updatedTask = await this.prisma.task.update({
      where: {
        id,
      },
      data: {
        ...data,
        isCompleted,
      },
    });
    return updatedTask;
  }

  async deleteTask(id: number, user: AuthUser) {
    const task = await this.getTaskById(id, user);
    await this.prisma.task.delete({
      where: {
        id,
      },
    });
    return task;
  }

  async getMyTasksStats(userId: string) {
    const completed = await this.prisma.task.count({
      where: {
        userId,
        isCompleted: {
          not: null,
        },
      },
    });
    const total = await this.prisma.task.count({
      where: {
        userId,
      },
    });
    const taskDates = await this.getTaskDates(userId);
    const longestStreak = calculateLongestStreak(taskDates);
    return { completed, total, longestStreak };
  }

  async getTaskDates(userId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { userId: userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    return tasks.map((task) => task.createdAt);
  }

  async getProductivityStats(
    userId: string,
    duration: 'daily' | 'weekly' | 'monthly',
  ) {
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
        COALESCE(SUM(CASE WHEN t.is_completed IS NOT NULL THEN 1 ELSE 0 END), 0) AS completed,
          COUNT(t.id) AS total
      FROM date_series ds
      LEFT JOIN tasks t ON ds.date = DATE(t.created_at) AND t.user_id = ${userId}
      GROUP BY ds.date
      ORDER BY ds.date ASC
      `;
    } else if (duration === 'weekly') {
      startDate = currentDate.clone().subtract(7 * 7, 'days');

      query = Prisma.sql`WITH week_series AS (
        SELECT generate_series(
                 date_trunc('week', ${startDate.toISOString()}::DATE),
                 date_trunc('week', ${currentDate.toISOString()}::DATE),
                 INTERVAL '1 week'
               )::DATE AS week_start
      )
      SELECT 
        TO_CHAR(ws.week_start, 'YY-MM-WW') AS date,
        COALESCE(SUM(CASE WHEN t.is_completed IS NOT NULL THEN 1 ELSE 0 END), 0) AS completed,
          COUNT(t.id) AS total
      FROM week_series ws
      LEFT JOIN tasks t ON ws.week_start = date_trunc('week', t.created_at) AND t.user_id = ${userId}
      GROUP BY ws.week_start
      ORDER BY ws.week_start ASC
      `;
    } else {
      startDate = currentDate.clone().subtract(7, 'months');

      query = Prisma.sql`WITH month_series AS (
          SELECT generate_series(
                   date_trunc('month', ${startDate.toISOString()}::DATE),
                   date_trunc('month', ${currentDate.toISOString()}::DATE),
                   INTERVAL '1 month'
                   )::DATE AS month_start
          )
          SELECT 
            TO_CHAR(ms.month_start, 'YY-MM-DD') AS date,
            COALESCE(SUM(CASE WHEN t.is_completed IS NOT NULL THEN 1 ELSE 0 END), 0) AS completed,
              COUNT(t.id) AS total
          FROM month_series ms
          LEFT JOIN tasks t ON ms.month_start = date_trunc('month', t.created_at) AND t.user_id = ${userId}
          GROUP BY ms.month_start
          ORDER BY ms.month_start ASC
          `;
    }

    const stats: Array<unknown> = await this.prisma.$queryRaw(query);
    const formattedStats = stats.map(
      (stat: { date: string; completed: bigint; total: bigint }) => ({
        ...stat,
        completed: Number(stat.completed),
        total: Number(stat.total),
      }),
    );

    return formattedStats;
  }
}
