import { PartialType } from '@nestjs/swagger';
import { CreateWishDto } from './create-wish.dto';
import { IsOptional } from 'class-validator';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  @IsOptional()
  description?: string;

  @IsOptional()
  image?: string;

  @IsOptional()
  price?: number;
}
