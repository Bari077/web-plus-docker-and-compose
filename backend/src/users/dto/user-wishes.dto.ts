import { Offer } from 'src/offers/entities/offer.entity';

export class UserWishesDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  link: string;
  image: string;
  price: number;
  raised: number;
  copied: number;
  description: string;
  offers: Offer[];
}
