import { AppModule } from '@/app.module';
import { DatabaseService } from '@/database/database.service';
import { CryptoService } from '@/shared/modules/crypto/crypto.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

describe('authentication e2e', () => {
    let app: INestApplication;
    let db: DatabaseService;
    let jwtService: JwtService;
    let crypto: CryptoService;

    beforeAll(async () => {
        jest.setTimeout(30000);

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        db = app.get<DatabaseService>(DatabaseService);
        jwtService = app.get<JwtService>(JwtService);
        crypto = app.get<CryptoService>(CryptoService);
        await app.init();
        userDB();
    }, 30000);

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

    async function login() {
        const payload = {
            email: 'admin',
            sub: 1,
            roles: ['admin'],
        };

        return {
            access_token: await jwtService.signAsync(payload),
            refresh_token: await jwtService.signAsync(payload),
        };
    }

    it('should be defined', async () => {
        expect(app).toBeDefined();
    });

    it('should login (as admin)', async () => {
        await userDB();
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                mutation {
                    login(auth: { email: "admin", password: "admin" }) {
                        access_token
                    }
                }
            `,
            });

        expect(res.body.data.login.access_token).toEqual(expect.any(String));
    });

    it("should not login (user doesn't exist)", async () => {
        await userDB();
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                mutation {
                    login(auth: { email: "user", password: "user" }) {
                        access_token
                    }
                }
            `,
            });

        expect(res.body.errors[0].message).toMatch(/user doesn't exist/i);
    });

    it('should register', async () => {
        await db.user.deleteMany();
        await userDB();
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                mutation {
                    register(auth: { email: "test user", password: "test user" }) {
                        access_token
                    }
                }
            `,
            });

        expect(res.body.data.register.access_token).toEqual(expect.any(String));
    });

    it('should not register as admin (permission denied)', async () => {
        await userDB();
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                mutation {
                    registerAdmin(auth: { email: "test user", password: "test user" }) {
                        access_token
                    }
                }
            `,
            });

        expect(res.body.errors[0].message).toMatch(/unauthorized/i);
    });

    it('should register as admin (as admin)', async () => {
        await db.user.deleteMany();
        await userDB();
        const { access_token } = await login();

        const res = await request(app.getHttpServer())
            .post('/graphql')
            .set('Authorization', `Bearer ${access_token}`)
            .send({
                query: `
                mutation {
                    registerAdmin(auth: { email: "test user", password: "test user" }) {
                        access_token
                    }
                }
            `,
            });

        expect(res.body.data.registerAdmin.access_token).toEqual(
            expect.any(String),
        );
    });

    it('should refresh token', async () => {
        await db.user.deleteMany();
        await userDB();
        const { refresh_token } = await login();

        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                mutation {
                    refresh(refreshToken: ${refresh_token}) {
                        access_token
                    }
                }
            `,
            });

        expect(res.body.data.refresh.access_token).toEqual(expect.any(String));
    });

    afterAll(async () => {
        await app.close();
    });
});
