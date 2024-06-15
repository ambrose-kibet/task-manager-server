import { Task } from '@prisma/client';
import { Exclude, Transform } from 'class-transformer';

export class TaskDto implements Task {
  id: number;
  title: string;
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
