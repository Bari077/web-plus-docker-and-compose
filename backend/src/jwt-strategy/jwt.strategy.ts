import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategyService extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_KEY + '',
    });
  }
  async validate(jwtPayload: { sub: number }) {
    const user = await this.usersService.findOne('id', jwtPayload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    this.usersService.sanitizeUser(user, 'password');
    return user;
  }
}
