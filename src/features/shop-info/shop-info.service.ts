import { DatabaseService } from '@/database/database.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ShopInfo } from '@prisma/client';
import { ShopInfoCreateModel } from './models/shop-info.create.model';
import { ShopInfoUpdateModel } from './models/shop-info.update.model';

@Injectable()
export class ShopInfoService {
    constructor(private readonly db: DatabaseService) {}

    async getShopInfo(): Promise<ShopInfo> {
        try {
            return await this.db.shopInfo.findFirstOrThrow({
                include: { socialMedia: true, openAt: true },
            });
        } catch {
            throw new NotFoundException("Shop info doesn't exist");
        }
    }

    async createShopInfo(shopInfo: ShopInfoCreateModel): Promise<ShopInfo> {
        try {
            const shopInfoExists = await this.getShopInfo();

            if (shopInfoExists) {
                const { openAt, socialMedia, ...rest } = shopInfo;

                const newShopInfo = await this.db.shopInfo.update({
                    where: { id: shopInfoExists.id },
                    data: {
                        ...rest,
                    },
                    include: { socialMedia: true, openAt: true },
                });

                return newShopInfo;
            }

            throw new NotFoundException("Shop info doesn't exist");
        } catch {
            const { openAt, socialMedia, ...rest } = shopInfo;

            const newShopInfo = await this.db.shopInfo.create({
                data: {
                    ...rest,
                },
                include: { socialMedia: true, openAt: true },
            });

            for (let openAt of shopInfo.openAt) {
                await this.db.openAt.create({
                    data: {
                        ...openAt,
                        shopInfoId: newShopInfo.id,
                    },
                });
            }

            for (let socialMedia of shopInfo.socialMedia) {
                await this.db.socialMedia.create({
                    data: {
                        ...socialMedia,
                        shopInfoId: newShopInfo.id,
                    },
                });
            }

            return newShopInfo;
        }
    }

    async updateShopInfo(shopInfo: ShopInfoUpdateModel): Promise<ShopInfo> {
        const shopInfoExists = await this.getShopInfo();
        const { openAt, socialMedia, ...rest } = shopInfo;

        if (shopInfoExists) {
            const updatedShopInfo = await this.db.shopInfo.update({
                where: { id: shopInfoExists.id },
                data: {
                    ...rest,
                },
                include: { socialMedia: true, openAt: true },
            });

            if (shopInfo.openAt) {
                for (let openAt of shopInfo.openAt) {
                    try {
                        await this.db.openAt.update({
                            where: { id: openAt.id },
                            data: {
                                ...openAt,
                            },
                        });
                    } catch {
                        throw new NotFoundException(
                            `Open at with the id ${openAt.id} doesn't exist`,
                        );
                    }
                }
            }

            if (shopInfo.socialMedia) {
                for (let socialMedia of shopInfo.socialMedia) {
                    try {
                        await this.db.socialMedia.update({
                            where: { id: socialMedia.id },
                            data: {
                                ...socialMedia,
                            },
                        });
                    } catch {
                        throw new NotFoundException(
                            `Social media with the id ${socialMedia.id} doesn't exist`,
                        );
                    }
                }
            }

            return updatedShopInfo;
        }
    }

    async deleteShopInfo(): Promise<ShopInfo> {
        const shopInfoExists = await this.getShopInfo();
        await this.db.openAt.deleteMany();
        await this.db.socialMedia.deleteMany();
        await this.db.shopInfo.deleteMany();
        return shopInfoExists;
    }
}
