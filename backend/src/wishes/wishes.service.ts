import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';
import { User } from 'src/users/entities/user.entity';
import { UserPublicProfileDto } from 'src/users/dto/user-public-profile-response.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishesRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, user: User): Promise<Wish> {
    createWishDto.owner = user;
    return await this.wishesRepository.save(createWishDto);
  }

  async findOne(id: number): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!wish) {
      throw new NotFoundException(`wish with id:${id} not found`);
    }
    return wish;
  }

  async findOneWithOwnerAndOffers(id: number): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        owner: true,
        offers: {
          user: {
            wishes: true,
            offers: true,
            wishlists: true,
          },
        },
      },
      select: {
        owner: UserPublicProfileDto,
      },
    });
    if (!wish) {
      throw new NotFoundException(`wish with id:${id} not found`);
    }

    return wish;
  }

  async findMany(key: string, value: string | number): Promise<Wish[]> {
    const wish = await this.wishesRepository.find({
      where: {
        [key]: value,
      },
    });
    if (wish.length < 1) {
      throw new NotFoundException(`no wishes found`);
    }
    return wish;
  }

  async findLast(qty: number): Promise<Wish[]> {
    return await this.wishesRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: qty,
      relations: {
        owner: true,
      },
      select: {
        owner: UserPublicProfileDto,
      },
    });
  }

  async findTop(qty: number): Promise<Wish[]> {
    return await this.wishesRepository.find({
      order: {
        copied: 'DESC',
      },
      take: qty,
      relations: {
        owner: true,
      },
      select: {
        owner: UserPublicProfileDto,
      },
    });
  }

  async findWishesByArrayOfId(itemsId: number[]): Promise<Wish[]> {
    const wishes = itemsId.map((item) => {
      return this.findOne(item);
    });

    return await Promise.all(wishes).then((items) => {
      return items;
    });
  }

  async updateOne(id: number, updateWishDto: UpdateWishDto) {
    return await this.wishesRepository
      .createQueryBuilder()
      .update()
      .set(updateWishDto)
      .where('id = :id', { id: id })
      .execute();
  }

  async updateRaised(id: number, amount: number) {
    return await this.wishesRepository
      .createQueryBuilder()
      .update()
      .set({
        raised: () => `raised + ${amount}`,
      })
      .where('id = :id', { id: id })
      .execute();
  }

  async remove(wishId: number) {
    return await this.wishesRepository.delete({ id: wishId });
  }

  async copy(whishId: number, user: User): Promise<Wish> {
    const wish = await this.findOneWithOwnerAndOffers(whishId);

    if (this.isWishOwner(user.id, wish)) {
      throw new ForbiddenException('You cannot copy your wishes');
    }

    const {
      /* eslint-disable */
      id,
      createdAt,
      updatedAt,
      raised,
      offers,
      wishlists,
      copied,
      /* eslint-enable */
      ...copyWishDto
    } = wish;
    copyWishDto.owner = user;

    this.wishesRepository
      .createQueryBuilder()
      .update()
      .set({
        copied: () => `"copied"+1`,
      })
      .where('id = :id', { id: id })
      .execute();

    return await this.wishesRepository.save(copyWishDto);
  }

  isWishOwner(id: number, wish: Wish) {
    if (id === wish.owner.id) {
      return true;
    }
    return false;
  }

  async ifHasOffer(wish: Wish) {
    if (wish.offers.length > 0) {
      throw new ForbiddenException(
        'Update restricted, there is already an offer',
      );
    }
    return;
  }
}
