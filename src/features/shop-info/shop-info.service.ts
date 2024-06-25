import { DB } from '@/database';
import { Injectable } from '@nestjs/common';
import { ShopInfo } from '@prisma/client';

@Injectable()
export class ShopInfoService {
    constructor(private readonly db: DB) {}

    async getShopInfo(): Promise<ShopInfo> {
        return await this.db.shopInfo.findFirst({
            include: { socialMedia: true, openAt: true },
        });
    }
}
