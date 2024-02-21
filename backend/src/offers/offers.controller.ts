import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtGuard } from 'src/jwt-strategy/jwt.guard';
import { WishesService } from 'src/wishes/wishes.service';
import { Offer } from './entities/offer.entity';

@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly wishesService: WishesService,
  ) {}

  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Req() req,
    @Body() createOfferDto: CreateOfferDto,
  ): Promise<Offer> {
    const user = req.user;
    const wish = await this.wishesService.findOneWithOwnerAndOffers(
      createOfferDto.itemId,
    );
    return await this.offersService.createOffer(createOfferDto, user, wish);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll(): Promise<Offer[]> {
    return this.offersService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Offer> {
    return this.offersService.findOneWithUserAndItem(id);
  }
}
