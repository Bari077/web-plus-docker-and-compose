import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashPasswordService } from 'src/hash-password/hash-password.service';
import { User } from './entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashPasswordService: HashPasswordService,
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    return this.usersRepository.save(createUserDto);
  }

  async findOne(key: string, value: string | number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        [key]: value,
      },
    });
    return user;
  }

  async findOneWithWishesIncludeOffers(
    key: string,
    value: string | number,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        [key]: value,
      },
      relations: {
        wishes: {
          offers: true,
        },
      },
    });
    return user;
  }

  async findOneWithWishesIncludeOwnerAndOffers(
    key: string,
    value: string | number,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        [key]: value,
      },
      order: {
        createdAt: 'DESC',
      },
      relations: {
        wishes: {
          owner: true,
          offers: true,
        },
      },
    });
    return user;
  }

  async findByUsernameOrEmail(value: string): Promise<User[]> {
    const user = await this.usersRepository.find({
      where: [{ username: value }, { email: value }],
    });
    return user;
  }

  async remove(userId: number) {
    return await this.usersRepository.delete({ id: userId });
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto) {
    
    await this.checkUserInDb(updateUserDto.username, updateUserDto.email);    
    if (updateUserDto.password) {
      const password = await this.hashPasswordService.hashPassword(
        updateUserDto.password,
      );
      delete updateUserDto.password;
      await this.usersRepository
        .createQueryBuilder()
        .update()
        .set({
          password: password,
        })
        .where('id = :id', { id: id })
        .execute();
    }

    await this.usersRepository
      .createQueryBuilder()
      .update()
      .set(updateUserDto)
      .where('id = :id', { id: id })
      .execute();
  }

  async checkUserInDb(username: string | undefined, email: string | undefined) {
    const usernameInDb = (username !== undefined) ?
     await this.findOne('username', username): null;

    const emailInDb = (email !== undefined) ?
      await this.findOne('email', email): null;    

    if (usernameInDb) {
      throw new HttpException('username already exists', HttpStatus.BAD_REQUEST)
    }
    if (emailInDb) {
      throw new HttpException('email already exists', HttpStatus.BAD_REQUEST);
    }    
  }

  async getUserWishes(id: number): Promise<Wish[]> {
    const user = await this.findOneWithWishesIncludeOwnerAndOffers('id', id);
    const wishes = user.wishes;
    wishes.forEach((wish) => {
      return this.sanitizeUser(wish.owner, 'password');
    });
    return wishes;
  }

  sanitizeUser(user: User, element: string) {
    delete user[element];
    return user;
  }
}
