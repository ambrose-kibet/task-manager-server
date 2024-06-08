import { AuthUser } from 'src/utils/types';

export class RequestWithUser extends Request {
  user: AuthUser;
}
