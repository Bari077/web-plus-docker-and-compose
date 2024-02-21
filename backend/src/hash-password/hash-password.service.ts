import { Injectable } from '@nestjs/common';
import { hash, genSalt, compare } from 'bcrypt';

@Injectable()
export class HashPasswordService {
  async hashPassword(password: string): Promise<string> {
    if (!password) {
      return;
    }
    const salt = await genSalt(10);
    const hashPassword = hash(password, salt);
    return hashPassword;
  }

  async areEqual(
    password: string,
    passwordToCompare: string,
  ): Promise<boolean> {
    return await compare(password, passwordToCompare);
  }
}
