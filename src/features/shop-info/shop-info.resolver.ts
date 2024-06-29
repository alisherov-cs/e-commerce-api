import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ShopInfoModel } from './models/shop-info.model';
import { ShopInfoService } from './shop-info.service';
import { ShopInfo } from '@prisma/client';
import { ShopInfoCreateModel } from './models/shop-info.create.model';
import { ShopInfoUpdateModel } from './models/shop-info.update.model';
import { UseGuards } from '@nestjs/common';
import { JWTAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/role.decorator';

@Resolver(() => ShopInfoModel)
export class ShopInfoResolver {
    constructor(private readonly shopInfoService: ShopInfoService) {}

    @Query(() => ShopInfoModel)
    async shopInfo(): Promise<ShopInfo> {
        return await this.shopInfoService.getShopInfo();
    }

    @Mutation(() => ShopInfoModel)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles('admin')
    async createShopInfo(
        @Args('shopInfo') shopInfo: ShopInfoCreateModel,
    ): Promise<ShopInfo> {
        return await this.shopInfoService.createShopInfo(shopInfo);
    }

    @Mutation(() => ShopInfoModel)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles('admin')
    async updateShopInfo(
        @Args('shopInfo') shopInfo: ShopInfoUpdateModel,
    ): Promise<ShopInfo> {
        return await this.shopInfoService.updateShopInfo(shopInfo);
    }

    @Mutation(() => ShopInfoModel)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles('admin')
    async deleteShopInfo(): Promise<ShopInfo> {
        return await this.shopInfoService.deleteShopInfo();
    }
}
