import { Module } from '@nestjs/common';
import { ShopInfoResolver } from './shop-info.resolver';
import { ShopInfoService } from './shop-info.service';
import { DatabaseModule } from '@/database/database.module';

@Module({
    imports: [DatabaseModule],
    providers: [ShopInfoResolver, ShopInfoService],
})
export class ShopInfoModule {}
