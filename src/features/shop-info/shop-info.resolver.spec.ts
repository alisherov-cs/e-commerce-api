import { Test, TestingModule } from '@nestjs/testing';
import { ShopInfoResolver } from './shop-info.resolver';
import { ShopInfoService } from './shop-info.service';
import { DatabaseService } from '@/database/database.service';
import { ShopInfoCreateModel } from './models/shop-info.create.model';
import { ShopInfoUpdateModel } from './models/shop-info.update.model';

describe('ShopInfoResolver', () => {
    let resolver: ShopInfoResolver;
    let service: ShopInfoService;
    let dbService: DatabaseService;

    const mockShopInfo = {
        id: 1,
        address: 'address',
        phoneNumber: '+998914225392',
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
                timeFrom: new Date(),
                timeTo: new Date(),
            },
        ],
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ShopInfoResolver,
                ShopInfoService,
                {
                    provide: DatabaseService,
                    useValue: {
                        shopInfo: {
                            findFirstOrThrow: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                        openAt: {
                            create: jest.fn(),
                            update: jest.fn(),
                        },
                        socialMedia: {
                            create: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        resolver = module.get<ShopInfoResolver>(ShopInfoResolver);
        service = module.get<ShopInfoService>(ShopInfoService);
        dbService = module.get<DatabaseService>(DatabaseService);
    });

    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });

    it('should get shop info', async () => {
        (dbService.shopInfo.findFirstOrThrow as jest.Mock).mockResolvedValue(
            mockShopInfo,
        );
        const result = await resolver.shopInfo();
        expect(result).toEqual(mockShopInfo);
    });

    it('should create shop info', async () => {
        const mockCreateShopInfo: ShopInfoCreateModel = {
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

        (dbService.shopInfo.create as jest.Mock).mockResolvedValue(
            mockShopInfo,
        );

        const result = await resolver.createShopInfo(mockCreateShopInfo);

        expect(result).toEqual(mockShopInfo);
    });

    it('should update shop info', async () => {
        const mockUpdateShopInfo: ShopInfoUpdateModel = {
            address: 'updat eaddress',
            phoneNumber: 'update +998914225392',
            email: 'update email@gmail.com',
            socialMedia: [
                {
                    id: 1,
                    name: 'update social media name',
                    link: 'update social media link',
                },
            ],
            openAt: [
                {
                    id: 1,
                    weekDayFrom: 'TUESDAY',
                    weekDayTo: 'SATURDAY',
                    timeFrom: new Date(),
                    timeTo: new Date(),
                },
            ],
        };

        (dbService.shopInfo.findFirstOrThrow as jest.Mock).mockResolvedValue(
            mockShopInfo,
        );
        (dbService.shopInfo.update as jest.Mock).mockResolvedValue({
            id: mockShopInfo.id,
            ...mockUpdateShopInfo,
        });

        for (let openAt of mockUpdateShopInfo.openAt) {
            (dbService.openAt.update as jest.Mock).mockResolvedValue(openAt);
        }

        for (let socialMedia of mockUpdateShopInfo.socialMedia) {
            (dbService.socialMedia.update as jest.Mock).mockResolvedValue(
                socialMedia,
            );
        }

        const result = await resolver.updateShopInfo(mockUpdateShopInfo);

        expect(result).toEqual({ id: mockShopInfo.id, ...mockUpdateShopInfo });
    });

    it('should delete shop info', async () => {
        (dbService.shopInfo.findFirstOrThrow as jest.Mock).mockResolvedValue(
            mockShopInfo,
        );
        (dbService.shopInfo.delete as jest.Mock).mockResolvedValue(
            mockShopInfo,
        );

        const result = await resolver.deleteShopInfo();

        expect(result).toEqual(mockShopInfo);
    });
});
