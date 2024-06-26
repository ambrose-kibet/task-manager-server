import {
  Body,
  Controller,
  Delete,
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
import {
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('tasks')
@ApiTags('Tasks')
@UseGuards(JwtAuthenticationGuard)
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Get all tasks of the user',
  })
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
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
  })
  @SerializeData(TaskDto)
  async createTask(
    @Req() req: RequestWithUser,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return await this.taskService.createTask(createTaskDto, req.user.id);
  }

  @Get('per-day')
  @ApiResponse({
    status: 200,
    description: 'Get all tasks of the user per day',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Get stats of the user tasks',
  })
  async getStats(@Req() req: RequestWithUser) {
    return await this.taskService.getMyTasksStats(req.user.id);
  }

  @Get('productivity-stats')
  @ApiResponse({
    status: 200,
    description: 'Get productivity stats of the user tasks',
  })
  @ApiQuery({
    name: 'duration',
    enum: ['daily', 'weekly', 'monthly'],
  })
  async getProductivityStats(
    @Req() req: RequestWithUser,
    @Query('duration') query: 'daily' | 'weekly' | 'monthly',
  ) {
    return await this.taskService.getProductivityStats(req.user.id, query);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Get task by id',
    type: TaskDto,
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the task to get',
    type: 'number',
  })
  @SerializeData(TaskDto)
  async getTask(@Req() req: RequestWithUser, @Param('id') id: number) {
    return await this.taskService.getTaskById(id, req.user);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: TaskDto,
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the task to update',
    type: 'number',
  })
  @SerializeData(TaskDto)
  async updateTask(
    @Req() req: RequestWithUser,
    @Body() updateTaskDto: UpdateTaskDto,
    @Param('id') id: number,
  ) {
    return await this.taskService.updateTask(id, updateTaskDto, req.user);
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Task deleted successfully',
    type: TaskDto,
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the task to delete',
    type: 'number',
  })
  @SerializeData(TaskDto)
  async deleteTask(@Req() req: RequestWithUser, @Param('id') id: number) {
    return await this.taskService.deleteTask(id, req.user);
  }
}
