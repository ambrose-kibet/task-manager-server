import { User } from '@prisma/client';

export class RequestWithUser extends Request {
  user: User;
}
