import { Query, Resolver } from '@nestjs/graphql';
import { ShopInfoModel } from './models/shop-info.model';
import { ShopInfoService } from './shop-info.service';
import { ShopInfo } from '@prisma/client';

@Resolver(() => ShopInfoModel)
export class ShopInfoResolver {
    constructor(private readonly shopInfoService: ShopInfoService) {}

    @Query(() => ShopInfoModel)
    async shopInfo(): Promise<ShopInfo> {
        return await this.shopInfoService.getShopInfo();
    }
}
