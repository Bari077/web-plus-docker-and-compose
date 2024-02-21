import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { UserPublicProfileDto } from 'src/users/dto/user-public-profile-response.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistsRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}
  async create(
    createWishlistDto: CreateWishlistDto,
    user: User,
  ): Promise<Wishlist> {
    createWishlistDto.owner = user;
    const { itemsId } = createWishlistDto;
    const items = await this.wishesService.findWishesByArrayOfId(itemsId);

    const wishlist = this.wishlistsRepository.create({
      ...createWishlistDto,
      items,
    });
    return this.wishlistsRepository.save(wishlist);
  }

  async findOneWithItemsAndOwner(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        items: true,
        owner: true,
      },
      select: {
        owner: UserPublicProfileDto,
      },
    });
    if (!wishlist) {
      throw new NotFoundException(`wishlist with id:${id} not found`);
    }
    return wishlist;
  }

  async findAll(): Promise<Wishlist[]> {
    return this.wishlistsRepository.find({
      relations: {
        owner: true,
        items: true,
      },
      select: {
        owner: UserPublicProfileDto,
      },
    });
  }

  async update(id: number, updateWishlistDto: UpdateWishlistDto) {
    const { itemsId } = updateWishlistDto;

    delete updateWishlistDto.itemsId;

    await this.wishlistsRepository
      .createQueryBuilder()
      .update()
      .set(updateWishlistDto)
      .where('id = :id', { id: id })
      .execute();

    if (itemsId && itemsId.length) {
      const wishlist = await this.findOneWithItemsAndOwner(id);
      const wishes = await this.wishesService.findWishesByArrayOfId(itemsId);
      wishlist.items = wishlist.items.concat(wishes);
      return await this.wishlistsRepository.save(wishlist);
    }

    return await this.findOneWithItemsAndOwner(id);
  }

  async remove(wishlistId: number) {
    return await this.wishlistsRepository.delete({ id: wishlistId });
  }

  isWishlistOwner(id: number, wishlist: Wishlist) {
    if (id === wishlist.owner.id) {
      return true;
    }
    return false;
  }
}
