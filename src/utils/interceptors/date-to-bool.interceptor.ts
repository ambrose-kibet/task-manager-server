import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class DateToBoolInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        return {
          count: data.count,
          tasks: data.tasks.map((task: { isCompleted: null | Date }) => {
            return {
              ...task,
              isCompleted: !!task.isCompleted,
            };
          }),
        };
      }),
    );
  }
}
