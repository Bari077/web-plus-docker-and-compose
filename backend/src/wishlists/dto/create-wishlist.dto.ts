import {
  IsString,
  IsArray,
  Length,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';

export class CreateWishlistDto {
  @IsString()
  @Length(1, 250)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1500)
  description?: string;

  @IsString()
  image?: string;

  @IsArray()
  itemsId?: number[];

  @ValidateNested()
  owner?: User;

  items?: Wish[];
}
