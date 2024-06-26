import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ShopInfoModel } from './models/shop-info.model';
import { ShopInfoService } from './shop-info.service';
import { ShopInfo } from '@prisma/client';
import { ShopInfoCreateModel } from './models/shop-info.create.model';
import { ShopInfoUpdateModel } from './models/shop-info.update.model';

@Resolver(() => ShopInfoModel)
export class ShopInfoResolver {
    constructor(private readonly shopInfoService: ShopInfoService) {}

    @Query(() => ShopInfoModel)
    async shopInfo(): Promise<ShopInfo> {
        return await this.shopInfoService.getShopInfo();
    }

    @Mutation(() => ShopInfoModel)
    async createShopInfo(
        @Args('shopInfo') shopInfo: ShopInfoCreateModel,
    ): Promise<ShopInfo> {
        return await this.shopInfoService.createShopInfo(shopInfo);
    }

    @Mutation(() => ShopInfoModel)
    async updateShopInfo(
        @Args('shopInfo') shopInfo: ShopInfoUpdateModel,
    ): Promise<ShopInfo> {
        return await this.shopInfoService.updateShopInfo(shopInfo);
    }

    @Mutation(() => ShopInfoModel)
    async deleteShopInfo(): Promise<ShopInfo> {
        return await this.shopInfoService.deleteShopInfo();
    }
}
