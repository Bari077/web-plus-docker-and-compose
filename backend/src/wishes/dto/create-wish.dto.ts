import {
  IsString,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class CreateWishDto {
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  name: string;

  @IsString()
  link: string;

  @IsString()
  image: string;

  @IsNumber()
  @Min(0.01)
  price: number;

  @IsString()
  description: string;

  @ValidateNested()
  owner: User;
}
