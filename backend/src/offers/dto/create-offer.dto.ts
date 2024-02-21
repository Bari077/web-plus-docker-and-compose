import { IsNumber, IsBoolean, Min, ValidateNested } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';

export class CreateOfferDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsBoolean()
  hidden: boolean;

  @IsNumber()
  itemId: number;

  @ValidateNested()
  user?: User;

  @ValidateNested()
  item?: Wish;
}
