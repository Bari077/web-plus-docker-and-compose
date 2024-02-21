import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { SignupUserResponseDto } from './dto/signup-user-response.dto';
import { HashPasswordService } from 'src/hash-password/hash-password.service';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly hashService: HashPasswordService,
    private jwtService: JwtService,
  ) {}

  auth(user: User) {
    const payload = { sub: user.id };

    return { access_token: this.jwtService.sign(payload) };
  }

  async validatePassword(username: string, password: string): Promise<User> {
    const user = await this.usersService.findOne('username', username);

    if (!user) {
      throw new HttpException(
        'проверьте правильность логина или пароля',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const areEqual = await this.hashService.areEqual(password, user.password);
    if (areEqual === false) {
      throw new HttpException(
        'проверьте правильность логина или пароля',
        HttpStatus.UNAUTHORIZED,
      );
    }

    this.usersService.sanitizeUser(user, 'password');
    return user;
  }

  async signUp(createUserDto: CreateUserDto): Promise<SignupUserResponseDto> {
    /*const usernameInDb = await this.usersService.findOne(
      'username',
      createUserDto.username,
    );
    const emailInDb = await this.usersService.findOne(
      'email',
      createUserDto.email,
    );

    if (usernameInDb || emailInDb) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }*/

    await this.usersService.checkUserInDb(createUserDto.username, createUserDto.email);

    const hashPassword = await this.hashService.hashPassword(
      createUserDto.password,
    );
    createUserDto.password = hashPassword;
    if (createUserDto.about.length < 1) {
      delete createUserDto.about;
    }
    console.log(createUserDto);
    const user = await this.usersService.create(createUserDto);
    return this.usersService.sanitizeUser(user, 'password');
  }
}
