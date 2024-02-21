import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Req,
  Post,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/jwt-strategy/jwt.guard';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { RemovePasswordInterceptor } from './interceptors/remove-password.interceptor';
import { Wish } from 'src/wishes/entities/wish.entity';
import { UserWishesDto } from './dto/user-wishes.dto';

@UseInterceptors(RemovePasswordInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  profile(@Req() req): Promise<UserProfileResponseDto> {
    const user = req.user;
    return user;
  }

  @UseGuards(JwtGuard)
  @Get('me/wishes')
  async getWishes(@Req() req): Promise<Wish[]> {
    const user = req.user;
    return await this.usersService.getUserWishes(user.id);
  }

  @UseGuards(JwtGuard)
  @Patch('me')
  async update(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserProfileResponseDto> {
    const id = req.user.id;
    await this.usersService.updateOne(id, updateUserDto);
    const user = await this.usersService.findOne('id', id);
    return user;
  }

  @UseGuards(JwtGuard)
  @Post('find')
  async findUsers(
    @Body() findUsersDto: FindUsersDto,
  ): Promise<UserProfileResponseDto[]> {
    const users = await this.usersService.findByUsernameOrEmail(
      findUsersDto.query,
    );
    return users;
  }

  @UseGuards(JwtGuard)
  @Get(':username')
  async findByUsername(
    @Param('username') username: string,
  ): Promise<UserProfileResponseDto> {
    const user = await this.usersService.findOne('username', username);
    this.usersService.sanitizeUser(user, 'email');
    return user;
  }

  @UseGuards(JwtGuard)
  @Get(':username/wishes')
  async findUserWish(
    @Param('username') username: string,
  ): Promise<UserWishesDto[]> {
    const user = await this.usersService.findOneWithWishesIncludeOffers(
      'username',
      username,
    );
    const wishes = user.wishes;
    return wishes;
  }
}
