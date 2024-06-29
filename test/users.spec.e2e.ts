import { AppModule } from '@/app.module';
import { DatabaseService } from '@/database/database.service';
import { AuthenticationService } from '@/features/authentication/authentication.service';
import { CryptoService } from '@/shared/modules/crypto/crypto.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

describe('users e2e', () => {
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
        await db.user.deleteMany();
    });

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
        };
    }

    async function getUser(email: string = 'admin') {
        return await db.user.findUnique({ where: { email } });
    }

    it('should be defined', async () => {
        expect(app).toBeDefined();
    });

    it('should get users (permission denied)', async () => {
        await userDB();
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                {
                    users {
                        id
                        email
                    }
                }
                `,
            });

        expect(res.body.errors[0].message).toMatch(/unauthorized/i);
    });

    it('should get users (as admin)', async () => {
        await userDB();
        const { access_token } = await login();

        const res = await request(app.getHttpServer())
            .post('/graphql')
            .set('Authorization', `Bearer ${access_token}`)
            .send({
                query: `
                {
                    users {
                        id
                        email
                        roles
                    }
                }
            `,
            });

        expect(res.body.data.users).toHaveLength(1);
    });

    it('should not get user by id (permission denied)', async () => {
        await db.user.deleteMany();
        await userDB();
        const { id } = await getUser();

        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                {
                    userById(id: ${id}) {
                        id
                        email
                        roles
                    }
                }
            `,
            });

        expect(res.body.errors[0].message).toMatch(/unauthorized/i);
    });

    it('should get user by id (as admin)', async () => {
        await db.user.deleteMany();
        await userDB();
        const { access_token } = await login();
        const { id } = await getUser();

        const res = await request(app.getHttpServer())
            .post('/graphql')
            .set('Authorization', `Bearer ${access_token}`)
            .send({
                query: `
                {
                    userById(id: ${id}) {
                        id
                        email
                        roles
                    }
                }
            `,
            });

        expect(res.body.data.userById.id).toEqual(expect.any(String));
    });

    it('should not get user by email (permission denied)', async () => {
        await db.user.deleteMany();
        await userDB();
        const { email } = await getUser();

        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                {
                    userByEmail(email: "${email}") {
                        id
                        email
                        roles
                    }
                }
            `,
            });

        expect(res.body.errors[0].message).toMatch(/unauthorized/i);
    });

    it('should get user by email (as admin)', async () => {
        await db.user.deleteMany();
        await userDB();
        const { access_token } = await login();
        const { email } = await getUser();

        const res = await request(app.getHttpServer())
            .post('/graphql')
            .set('Authorization', `Bearer ${access_token}`)
            .send({
                query: `
                {
                    userByEmail(email: "${email}") {
                        id
                        email
                        roles
                    }
                }
            `,
            });

        expect(res.body.data.userByEmail.id).toEqual(expect.any(String));
    });

    it('should not create user (permission denied)', async () => {
        await userDB();
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                mutation {
                    createUser(user: { email: "user", password: "user", roles: ["user"] }) {
                        id
                        email
                    }
                }
            `,
            });

        expect(res.body.errors[0].message).toMatch(/unauthorized/i);
    });

    it('should create user (as admin)', async () => {
        await db.user.deleteMany();
        await userDB();
        const { access_token } = await login();

        const res = await request(app.getHttpServer())
            .post('/graphql')
            .set('Authorization', `Bearer ${access_token}`)
            .send({
                query: `
                mutation {
                    createUser(user: { email: "user", password: "user", roles: ["user"] }) {
                        id
                        email
                    }
                }
            `,
            });

        expect(res.body.data.createUser.id).toEqual(expect.any(String));
    });

    it('should not update user (permission denied)', async () => {
        await userDB();
        const { id } = await getUser();

        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                mutation {
                    updateUser(id: ${id}, user: { email: "user update", password: "user update" }) {
                        id
                    }
                }
            `,
            });

        expect(res.body.errors[0].message).toMatch(/unauthorized/i);
    });

    it('should update user (as admin)', async () => {
        await db.user.deleteMany();
        await userDB();
        const { access_token } = await login();
        const { id } = await getUser();

        const res = await request(app.getHttpServer())
            .post('/graphql')
            .set('Authorization', `Bearer ${access_token}`)
            .send({
                query: `
                mutation {
                    updateUser(id: ${id}, user: { email: "user update", password: "user update" }) {
                        id
                        email
                    }
                }
            `,
            });

        expect(res.body.data.updateUser.email).toEqual('user update');
    });

    it('should not delete (permission denied)', async () => {
        await userDB();
        const { id } = await getUser();

        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                    mutation {
                        deleteUser(id: ${id}) {
                            id
                        }
                    }
                `,
            });

        expect(res.body.errors[0].message).toMatch(/unauthorized/i);
    });

    it('should delete (as admin)', async () => {
        await userDB();
        const { access_token } = await login();
        const { id } = await getUser();

        const res = await request(app.getHttpServer())
            .post('/graphql')
            .set('Authorization', `Bearer ${access_token}`)
            .send({
                query: `
                    mutation {
                        deleteUser(id: ${id}) {
                            id
                            email
                        }
                    }
                `,
            });

        expect(res.body.data.deleteUser.email).toEqual('admin');
    });

    afterAll(async () => {
        await app.close();
    });
});
