import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Patch,
  Param,
  Get,
  Delete,
} from '@nestjs/common';
import { JwtGuard } from 'src/jwt-strategy/jwt.guard';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { ForbiddenException } from '@nestjs/common';
import { Wish } from './entities/wish.entity';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Req() req,
    @Body() createWishDto: CreateWishDto,
  ): Promise<Wish> {
    const user = req.user;
    return this.wishesService.create(createWishDto, user);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Req() req,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    const userId = req.user.id;
    const wish = await this.wishesService.findOneWithOwnerAndOffers(id);
    if (!this.wishesService.isWishOwner(userId, wish)) {
      throw new ForbiddenException('You cannot edit other users wishes');
    }
    await this.wishesService.ifHasOffer(wish);
    return await this.wishesService.updateOne(id, updateWishDto);
  }

  @Get('last')
  async findLast(): Promise<Wish[]> {
    return await this.wishesService.findLast(40);
  }

  @Get('top')
  async findTop(): Promise<Wish[]> {
    return await this.wishesService.findTop(20);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Wish> {
    return await this.wishesService.findOneWithOwnerAndOffers(id);
  }

  @UseGuards(JwtGuard)
  @Post(':id/copy')
  async copyOne(@Param('id') id: number, @Req() req): Promise<Wish> {
    const user = req.user;
    return this.wishesService.copy(id, user);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() req) {
    const userId = req.user.id;
    const wish = await this.wishesService.findOneWithOwnerAndOffers(id);
    if (!this.wishesService.isWishOwner(userId, wish)) {
      throw new ForbiddenException('You cannot delete other users wishes');
    }
    return await this.wishesService.remove(id);
  }
}
