import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable, map } from 'rxjs';
import { User } from '../entities/user.entity';

@Injectable()
export class RemovePasswordInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        const deletePassword = (user: User) => {
          delete user.password;
        };

        if (Array.isArray(data)) {
          data.forEach(deletePassword);
        } else {
          deletePassword(data);
        }
        return data;
      }),
    );
  }
}
