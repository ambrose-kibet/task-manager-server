import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/auth/request-with-user.interface';
import { CreateTaskDto } from './Dtos/create-task.dto';
import { TasksService } from './tasks.service';

import { TaskQueryDto } from './Dtos/tasks-query.dto';
import { SerializeData } from 'src/utils/interceptors/transfrom-data.interceptor';
import { TaskDto } from './Dtos/task.dto';
import { DateToBoolInterceptor } from 'src/utils/interceptors/date-to-bool.interceptor';
import { UpdateTaskDto } from './Dtos/update-task.dto';
import { AllTasksQueryDto } from './Dtos/all-tasks-query.dto';

@Controller('tasks')
@UseGuards(JwtAuthenticationGuard)
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Get()
  async getAllTasks(
    @Req() req: RequestWithUser,
    @Query() query: AllTasksQueryDto,
  ) {
    return await this.taskService.getMyTasks(
      req.user.id,
      parseInt(query.page, 10),
    );
  }

  @Post()
  @SerializeData(TaskDto)
  async createTask(
    @Req() req: RequestWithUser,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return await this.taskService.createTask(createTaskDto, req.user.id);
  }

  @Get('per-day')
  @UseInterceptors(new DateToBoolInterceptor())
  async getTasksPerDay(
    @Req() req: RequestWithUser,
    @Query() query: TaskQueryDto,
  ) {
    return await this.taskService.getMyTasksPerDay({
      userId: req.user.id,
      date: query.date,
      title: query.title,
      sort: query.sort,
      page: parseInt(query.page, 10),
    });
  }

  @Get('stats')
  async getStats(@Req() req: RequestWithUser) {
    return await this.taskService.getMyTasksStats(req.user.id);
  }

  @Get('productivity-stats')
  async getProductivityStats(
    @Req() req: RequestWithUser,
    @Query('duration') query: 'daily' | 'weekly' | 'monthly',
  ) {
    return await this.taskService.getProductivityStats(req.user.id, query);
  }

  @Get(':id')
  @SerializeData(TaskDto)
  async getTask(@Req() req: RequestWithUser, @Param('id') id: number) {
    return await this.taskService.getTaskById(id, req.user);
  }

  @Patch(':id')
  @SerializeData(TaskDto)
  async updateTask(
    @Req() req: RequestWithUser,
    @Body() updateTaskDto: UpdateTaskDto,
    @Param('id') id: number,
  ) {
    console.log('updateTaskDto', updateTaskDto);

    return await this.taskService.updateTask(id, updateTaskDto, req.user);
  }
}
