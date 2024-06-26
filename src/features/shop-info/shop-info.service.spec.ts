import { Test, TestingModule } from '@nestjs/testing';
import { ShopInfoService } from './shop-info.service';
import { DatabaseService } from '@/database/database.service';
import { NotFoundException } from '@nestjs/common';
import { ShopInfoCreateModel } from './models/shop-info.create.model';
import { ShopInfoUpdateModel } from './models/shop-info.update.model';

describe('ShopInfoService', () => {
    let service: ShopInfoService;
    let dbService: DatabaseService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ShopInfoService,
                {
                    provide: DatabaseService,
                    useValue: {
                        shopInfo: {
                            findFirstOrThrow: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                            deleteMany: jest.fn(),
                        },
                        openAt: {
                            create: jest.fn(),
                            update: jest.fn(),
                            deleteMany: jest.fn(),
                        },
                        socialMedia: {
                            create: jest.fn(),
                            update: jest.fn(),
                            deleteMany: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<ShopInfoService>(ShopInfoService);
        dbService = module.get<DatabaseService>(DatabaseService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    const mockShopInfo = {
        id: 1,
        address: 'address',
        phoneNumber: 'phone number',
        email: 'email@gmail.com',
        socialMedia: [
            {
                id: 1,
                name: 'social media name',
                link: 'social media link',
            },
        ],
        openAt: [
            {
                id: 1,
                weekDayFrom: 'MONDAY',
                weekDayTo: 'FRIDAY',
                timeFrom: '2000-01-01T00:00:00.000Z',
                timeTo: '2000-01-01T00:00:00.000Z',
            },
        ],
    };

    describe('getShopInfo', () => {
        it('should return shop info', async () => {
            (
                dbService.shopInfo.findFirstOrThrow as jest.Mock
            ).mockResolvedValue(mockShopInfo);

            const result = await service.getShopInfo();

            expect(result).toEqual(mockShopInfo);
            expect(dbService.shopInfo.findFirstOrThrow).toHaveBeenCalledWith({
                include: { socialMedia: true, openAt: true },
            });
        });

        it('should throw NotFoundException if no shop info found', async () => {
            (
                dbService.shopInfo.findFirstOrThrow as jest.Mock
            ).mockRejectedValue(new Error());

            await expect(service.getShopInfo()).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('createShopInfo', () => {
        it('should create new shop info', async () => {
            const mockShopInfo: ShopInfoCreateModel = {
                address: 'address',
                phoneNumber: '+998914225392',
                email: 'email@gmail.com',
                socialMedia: [
                    {
                        name: 'social media name',
                        link: 'social media link',
                    },
                ],
                openAt: [
                    {
                        weekDayFrom: 'MONDAY',
                        weekDayTo: 'FRIDAY',
                        timeFrom: new Date(),
                        timeTo: new Date(),
                    },
                ],
            };
            const createdShopInfo = { id: 1, ...mockShopInfo };

            const { openAt, socialMedia, ...rest } = mockShopInfo;

            (dbService.shopInfo.create as jest.Mock).mockResolvedValue({
                id: 1,
                ...mockShopInfo,
            });

            const result = await service.createShopInfo(mockShopInfo);

            expect(result).toEqual(createdShopInfo);
            expect(dbService.shopInfo.create).toHaveBeenCalledWith({
                data: { ...rest },
                include: { socialMedia: true, openAt: true },
            });

            for (let openAt of mockShopInfo.openAt) {
                expect(dbService.openAt.create).toHaveBeenCalledWith({
                    data: { shopInfoId: createdShopInfo.id, ...openAt },
                });
            }

            for (let socialMedia of mockShopInfo.socialMedia) {
                expect(dbService.socialMedia.create).toHaveBeenCalledWith({
                    data: { shopInfoId: createdShopInfo.id, ...socialMedia },
                });
            }
        });
    });

    describe('updateShopInfo', () => {
        it('should update existing shop info', async () => {
            const mockShopInfo: ShopInfoUpdateModel = {
                address: 'updated address',
                phoneNumber: 'updated +998914225392',
                email: 'updated email',
                openAt: [
                    {
                        id: 1,
                        weekDayFrom: 'TUESDAY',
                        weekDayTo: 'SATURDAY',
                        timeFrom: new Date(),
                        timeTo: new Date(),
                    },
                ],
                socialMedia: [
                    {
                        id: 1,
                        name: 'updated social media name',
                        link: 'updated social media link',
                    },
                ],
            };
            const existingShopInfo = {
                id: 1,
                address: 'old address',
                phoneNumber: 'old phone number',
                email: 'old email@gmail.com',
                openAt: [
                    {
                        id: 1,
                        weekDayFrom: 'MONDAY',
                        weekDayTo: 'FRIDAY',
                        timeFrom: new Date(),
                        timeTo: new Date(),
                    },
                ],
                socialMedia: [
                    {
                        id: 1,
                        name: 'social media name',
                        link: 'social media link',
                    },
                ],
            };

            (
                dbService.shopInfo.findFirstOrThrow as jest.Mock
            ).mockResolvedValue(existingShopInfo);
            (dbService.shopInfo.update as jest.Mock).mockResolvedValue({
                id: existingShopInfo.id,
                ...mockShopInfo,
            });

            const { openAt, socialMedia, ...rest } = mockShopInfo;
            const result = await service.updateShopInfo(mockShopInfo);

            expect(result).toEqual({
                id: existingShopInfo.id,
                ...mockShopInfo,
            });
            expect(dbService.shopInfo.update).toHaveBeenCalledWith({
                where: { id: existingShopInfo.id },
                data: rest,
                include: { socialMedia: true, openAt: true },
            });

            for (let openAt of mockShopInfo.openAt) {
                expect(dbService.openAt.update).toHaveBeenCalledWith({
                    where: { id: openAt.id },
                    data: openAt,
                });
            }

            for (let socialMedia of mockShopInfo.socialMedia) {
                expect(dbService.socialMedia.update).toHaveBeenCalledWith({
                    where: { id: socialMedia.id },
                    data: socialMedia,
                });
            }
        });
    });

    describe('deleteShopInfo', () => {
        it('should delete shop info', async () => {
            const existingShopInfo = {
                id: 1,
                address: 'old address',
                phoneNumber: 'old phone number',
                email: 'email@gmail.com',
                socialMedia: [],
                openAt: [],
            };

            (
                dbService.shopInfo.findFirstOrThrow as jest.Mock
            ).mockResolvedValue(existingShopInfo);
            (dbService.shopInfo.deleteMany as jest.Mock).mockResolvedValue(
                existingShopInfo,
            );

            const result = await service.deleteShopInfo();

            expect(result).toEqual(existingShopInfo);
            expect(dbService.shopInfo.deleteMany).toHaveBeenCalledWith();
        });
    });
});
