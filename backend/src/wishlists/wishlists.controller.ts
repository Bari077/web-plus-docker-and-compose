import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtGuard } from 'src/jwt-strategy/jwt.guard';
import { Wishlist } from './entities/wishlist.entity';

@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Req() req,
    @Body() createWishlistDto: CreateWishlistDto,
  ): Promise<Wishlist> {
    const user = req.user;
    return await this.wishlistsService.create(createWishlistDto, user);
  }

  @Get()
  async findAll(): Promise<Wishlist[]> {
    return await this.wishlistsService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Wishlist> {
    return await this.wishlistsService.findOneWithItemsAndOwner(id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Req() req,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    const userId = req.user.id;
    const wishlist = await this.wishlistsService.findOneWithItemsAndOwner(id);
    if (!this.wishlistsService.isWishlistOwner(userId, wishlist)) {
      throw new ForbiddenException('You cannot edit other users wishlists');
    }
    return await this.wishlistsService.update(id, updateWishlistDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: number) {
    const userId = req.user.id;
    const wishlist = await this.wishlistsService.findOneWithItemsAndOwner(id);
    if (!this.wishlistsService.isWishlistOwner(userId, wishlist)) {
      throw new ForbiddenException('You cannot delete other users wishlists');
    }
    return this.wishlistsService.remove(id);
  }
}
