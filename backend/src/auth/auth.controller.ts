import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { SignupUserResponseDto } from './dto/signup-user-response.dto';
import { SigninUserResponseDto } from './dto/signin-user-response.dto';
import { LocalGuard } from './local.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() user: CreateUserDto): Promise<SignupUserResponseDto> {
    return await this.authService.signUp(user);
  }

  @UseGuards(LocalGuard)
  @Post('signin')
  async signin(@Req() req): Promise<SigninUserResponseDto> {
    return this.authService.auth(req.user);
  }
}
