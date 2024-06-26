import { Task } from '@prisma/client';
import { Exclude, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TaskDto implements Task {
  @ApiProperty({
    example: '1',
    description: 'The id of the task',
  })
  id: number;

  @ApiProperty({
    example: 'Task title',
    description: 'The title of the task',
  })
  title: string;

  @ApiProperty({
    example: 'Task description',
    description: 'The description of the task',
  })
  description: string;

  @Transform(({ value }) => !!value)
  isCompleted: Date | null;

  @Exclude()
  userId: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
