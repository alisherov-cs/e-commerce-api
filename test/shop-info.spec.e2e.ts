import { DatabaseService } from '@/database/database.service';
import { ShopInfoModule } from '@/features/shop-info/shop-info.module';
import { ShopInfoResolver } from '@/features/shop-info/shop-info.resolver';
import { ShopInfoService } from '@/features/shop-info/shop-info.service';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

describe('Shop Info (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                GraphQLModule.forRoot<ApolloDriverConfig>({
                    driver: ApolloDriver,
                    playground: true,
                    autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
                }),
                ShopInfoModule,
            ],
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

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('clear database', async () => {
        await request(app.getHttpServer())
            .post('/graphql')
            .send({ query: 'mutation { deleteShopInfo { id } }' });
    });

    it('should not get shop info', async () => {
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({ query: '{ shopInfo { id } }' });

        expect(res.body.errors[0].extensions?.status).toEqual(404);
        expect(res.body.errors[0].message).toEqual("Shop info doesn't exist");
    });

    it('should create shop info', async () => {
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                mutation {
                    createShopInfo(
                        shopInfo: {
                            address: "test address",
                            phoneNumber: "test phone number",
                            email: "test email",
                            socialMedia: [
                                {
                                    name: "test social media name",
                                    link: "test social media link"
                                }
                            ],
                            openAt: [
                                {
                                    weekDayFrom: "MONDAY",
                                    weekDayTo: "FRIDAY",
                                    timeFrom: "2022-01-01T00:00:00.000Z",
                                    timeTo: "2022-01-01T00:00:00.000Z"
                                }
                            ]
                        }
                    ) {
                        id
                    }
                }
                `,
            });
        expect(res.status).toEqual(200);
        expect(+res.body.data.createShopInfo.id).toEqual(expect.any(Number));
    });

    it('should get shop info', async () => {
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `{ 
                    shopInfo { 
                        id
                        address
                        phoneNumber
                        email
                        socialMedia {
                            id
                            name
                            link
                        }
                        openAt {
                            id
                            weekDayFrom
                            weekDayTo
                            timeFrom
                            timeTo
                        }
                    } 
                }`,
            });

        expect(res.status).toEqual(200);
        expect(res.body.data.shopInfo).toEqual({
            id: expect.any(String),
            address: 'test address',
            phoneNumber: 'test phone number',
            email: 'test email',
            socialMedia: [
                {
                    id: expect.any(String),
                    name: 'test social media name',
                    link: 'test social media link',
                },
            ],
            openAt: [
                {
                    id: expect.any(String),
                    weekDayFrom: 'MONDAY',
                    weekDayTo: 'FRIDAY',
                    timeFrom: '2022-01-01T00:00:00.000Z',
                    timeTo: '2022-01-01T00:00:00.000Z',
                },
            ],
        });
    });

    it('should update shop info', async () => {
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                mutation {
                    updateShopInfo(
                        shopInfo: {
                            address: "test address update",
                            phoneNumber: "test phone number update",
                            email: "test email update",
                        }
                    ) {
                        id
                        address
                    }
                }
                `,
            });
        expect(res.status).toEqual(200);
        expect(+res.body.data.updateShopInfo.id).toEqual(expect.any(Number));
        expect(res.body.data.updateShopInfo.address).toEqual(
            'test address update',
        );
    });

    it('should delete shop info', async () => {
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({ query: 'mutation { deleteShopInfo { id } }' });

        expect(res.status).toEqual(200);
        expect(+res.body.data.deleteShopInfo.id).toEqual(expect.any(Number));
    });

    it('should not get shop info', async () => {
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({ query: '{ shopInfo { id } }' });

        expect(res.body.errors[0].extensions?.status).toEqual(404);
        expect(res.body.errors[0].message).toEqual("Shop info doesn't exist");
    });
});
