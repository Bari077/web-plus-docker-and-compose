import { PartialType } from '@nestjs/swagger';
import { CreateWishlistDto } from './create-wishlist.dto';
import { IsString, Length, IsArray } from 'class-validator';

export class UpdateWishlistDto extends PartialType(CreateWishlistDto) {
  @IsString()
  @Length(1, 250)
  name?: string;

  @IsString()
  @Length(0, 1500)
  description?: string;

  @IsString()
  image?: string;

  @IsArray()
  itemsId?: number[];
}
