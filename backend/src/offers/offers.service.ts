import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { UserPublicProfileDto } from 'src/users/dto/user-public-profile-response.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    private readonly dataSource: DataSource,
    private readonly wishesService: WishesService,
  ) {}

  async create(createOfferDto: CreateOfferDto): Promise<Offer> {
    return await this.offersRepository.save(createOfferDto);
  }

  async findOne(id: number): Promise<Offer> {
    const offer = await this.offersRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!offer) {
      throw new NotFoundException(`offer with id:${id} not found`);
    }
    return offer;
  }

  async findOneWithUserAndItem(id: number): Promise<Offer> {
    const offer = await this.offersRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        user: true,
        item: true,
      },
      select: {
        user: UserPublicProfileDto,
      },
    });
    if (!offer) {
      throw new NotFoundException(`offer with id:${id} not found`);
    }
    return offer;
  }

  async findAll(): Promise<Offer[]> {
    const offers = await this.offersRepository.find({
      relations: {
        user: true,
        item: true,
      },
      select: {
        user: UserPublicProfileDto,
      },
    });

    if (offers.length < 1) {
      throw new NotFoundException(`offers not found`);
    }

    return offers;
  }

  getMaxAmount(wish: Wish): number {
    const price = wish.price;
    const raised = wish.raised;
    const maxAmount = price - raised;
    return maxAmount;
  }

  async createOffer(
    createOfferDto: CreateOfferDto,
    user: User,
    item: Wish,
  ): Promise<Offer> {
    if (this.wishesService.isWishOwner(user.id, item)) {
      throw new ForbiddenException('You cannot make offer for your own wish');
    }
    const maxAmount = this.getMaxAmount(item);
    if (createOfferDto.amount > maxAmount) {
      throw new BadRequestException('Invalid amount', {
        cause: new Error(),
        description: `The amount must not exceed ${maxAmount}`,
      });
    }
    createOfferDto.user = user;
    createOfferDto.item = item;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const offer = await this.create(createOfferDto);
      await this.wishesService.updateRaised(item.id, createOfferDto.amount);
      await queryRunner.commitTransaction();
      return this.findOne(offer.id);
    } catch {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
