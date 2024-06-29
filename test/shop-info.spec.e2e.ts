import { AppModule } from '@/app.module';
import { DatabaseService } from '@/database/database.service';
import { AuthenticationService } from '@/features/authentication/authentication.service';
import { CryptoService } from '@/shared/modules/crypto/crypto.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

describe('shop-info e2e', () => {
    let app: INestApplication;
    let authService: AuthenticationService;
    let jwtService: JwtService;
    let db: DatabaseService;
    let crypto: CryptoService;

    beforeAll(async () => {
        jest.setTimeout(30000);

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        authService = app.get<AuthenticationService>(AuthenticationService);
        jwtService = app.get<JwtService>(JwtService);
        db = app.get<DatabaseService>(DatabaseService);
        crypto = app.get<CryptoService>(CryptoService);
        await app.init();
        await userDB();
        await shopInfoDB();
    }, 30000);

    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function userDB() {
        try {
            await db.user.create({
                data: {
                    email: 'admin',
                    password: await crypto.hash('admin'),
                    roles: ['admin'],
                },
            });
        } catch {}
    }

    async function shopInfoDB() {
        await db.openAt.deleteMany();
        await db.socialMedia.deleteMany();
        await db.shopInfo.deleteMany();
        sleep(1000);
        const shopInfo = await db.shopInfo.create({
            data: {
                address: 'address',
                phoneNumber: 'phoneNumber',
                email: 'email',
            },
        });
        await db.openAt.create({
            data: {
                weekDayFrom: 'MONDAY',
                weekDayTo: 'FRIDAY',
                timeFrom: new Date(),
                timeTo: new Date(),
                shopInfoId: shopInfo.id,
            },
        });
        await db.socialMedia.create({
            data: {
                name: 'facebook',
                link: 'link',
                shopInfoId: shopInfo.id,
            },
        });
    }

    async function login() {
        const payload = {
            email: 'admin',
            sub: 1,
            roles: ['admin'],
        };

        return {
            access_token: await jwtService.signAsync(payload),
        };
    }

    it('should be defined', async () => {
        expect(app).toBeDefined();
    });

    it('should get shop info', async () => {
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                {
                    shopInfo {
                        address
                        phoneNumber
                        email
                        openAt {
                            id
                        }
                        socialMedia {
                            name
                        }
                    }
                }
            `,
            });

        expect(res.body.data.shopInfo.address).toEqual('address');
    });

    it('should not create shop info (permission denied)', async () => {
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                mutation {
                    createShopInfo(shopInfo: { address: "address", phoneNumber: "phoneNumber", email: "email", openAt: [], socialMedia: [] }) {
                        id
                    }
                }
            `,
            });

        expect(res.body.errors[0].message).toMatch(/unauthorized/i);
    });

    it('should create shop info (as admin)', async () => {
        const { access_token } = await login();

        const res = await request(app.getHttpServer())
            .post('/graphql')
            .set('Authorization', `Bearer ${access_token}`)
            .send({
                query: `
                mutation {
                    createShopInfo(shopInfo: { address: "address", phoneNumber: "phoneNumber", email: "email", openAt: [], socialMedia: [] }) {
                        id
                    }
                }
            `,
            });

        expect(res.body.data.createShopInfo.id).toEqual(expect.any(String));
    });

    it('should not update shop info (permission denied)', async () => {
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                mutation {
                    updateShopInfo(shopInfo: { address: "new address" }) {
                        id
                    }
                }
            `,
            });

        expect(res.body.errors[0].message).toMatch(/unauthorized/i);
    });

    it('should update shop info (as admin)', async () => {
        const { access_token } = await login();

        const res = await request(app.getHttpServer())
            .post('/graphql')
            .set('Authorization', `Bearer ${access_token}`)
            .send({
                query: `
                mutation {
                    updateShopInfo(shopInfo: { address: "new address" }) {
                        id
                        address
                    }
                }
            `,
            });

        expect(res.body.data.updateShopInfo.address).toEqual('new address');
    });

    it('should not delete shop info (permission denied)', async () => {
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                mutation {
                    deleteShopInfo {
                        id
                    }
                }
            `,
            });

        expect(res.body.errors[0].message).toMatch(/unauthorized/i);
    });

    it('should delete shop info (as admin)', async () => {
        await userDB();
        const { access_token } = await login();

        const res = await request(app.getHttpServer())
            .post('/graphql')
            .set('Authorization', `Bearer ${access_token}`)
            .send({
                query: `
                mutation {
                    deleteShopInfo {
                        id
                    }
                }
            `,
            });

        expect(res.body.data.deleteShopInfo.id).toEqual(expect.any(String));
    });

    afterAll(async () => {
        await app.close();
    });
});
