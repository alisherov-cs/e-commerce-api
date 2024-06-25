import { Module } from '@nestjs/common';
import { ShopInfoResolver } from './shop-info.resolver';
import { ShopInfoService } from './shop-info.service';
import { DB } from '@/database';

@Module({
    imports: [DB],
    providers: [ShopInfoResolver, ShopInfoService],
})
export class ShopInfoModule {}
