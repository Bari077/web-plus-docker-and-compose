import { IsString, IsNotEmpty, Length } from 'class-validator';

export class SigninUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 30)
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
