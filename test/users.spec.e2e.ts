import { DatabaseService } from '@/database/database.service';
import { AuthenticationModule } from '@/features/authentication/authentication.module';
import { AuthenticationResolver } from '@/features/authentication/authentication.resolver';
import { UsersModule } from '@/features/users/users.module';
import { UsersResolver } from '@/features/users/users.resolver';
import { UsersService } from '@/features/users/users.service';
import { CryptoService } from '@/shared/modules/crypto/crypto.service';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

describe('Users (e2e)', () => {
    let app: INestApplication;
    let db: DatabaseService;
    let crypto: CryptoService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                GraphQLModule.forRoot<ApolloDriverConfig>({
                    driver: ApolloDriver,
                    playground: true,
                    autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
                }),
                AuthenticationModule,
                UsersModule,
            ],
            providers: [
                UsersResolver,
                AuthenticationResolver,
                UsersService,
                {
                    provide: DatabaseService,
                    useValue: {
                        user: {
                            findMany: jest.fn(),
                            findUniqueOrThrow: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                            deleteMany: jest.fn(),
                        },
                    },
                },
                {
                    provide: CryptoService,
                    useValue: {
                        hash: jest.fn(),
                        compare: jest.fn(),
                    },
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        db = moduleFixture.get<DatabaseService>(DatabaseService);
        crypto = moduleFixture.get<CryptoService>(CryptoService);
        await app.init();

        await db.user.deleteMany();
        await db.user.create({
            data: {
                email: 'admin',
                password: await crypto.hash('admin'),
                roles: ['admin'],
            },
        });
    });

    it('should be defined', () => {
        expect(app).toBeDefined();
    });

    async function getUser() {
        const users = await db.user.findMany();
        return users.at(-1);
    }

    async function getAccessToken() {
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                mutation 
                { 
                    login(auth: { email: "admin", password: "admin" }) { 
                        access_token 
                    } 
                }`,
            });
        return res.body.data.login.access_token;
    }

    it('should not get users (permission denied)', async () => {
        const res = await request(app.getHttpServer()).post('/graphql').send({
            query: '{ users { id } }',
        });
        expect(res.body.errors[0].message).toEqual('Unauthorized');
    });

    it('should not create user (permission denied)', async () => {
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
            mutation {
                createUser(
                    user: {
                        email: "test email",
                        password: "test password",
                        roles: ["user"]
                    }
                ) {
                    id
                }
            }
            `,
            });
        expect(res.body.errors[0].message).toEqual('Unauthorized');
    });

    it('should not get users (permission denied)', async () => {
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `{
                users 
                { 
                    id 
                    email
                    password
                } 
            }`,
            });
        expect(res.body.errors[0].message).toEqual('Unauthorized');
    });

    it('should not get user by email (permission denied)', async () => {
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `{
                userByEmail(email: "test email") {
                    id
                    email
                    password
                }
            }`,
            });
        expect(res.body.errors[0].message).toEqual('Unauthorized');
    });

    it('should not update user (permission denied)', async () => {
        const user = await getUser();
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                mutation {
                    updateUser(
                        id: ${user.id}
                        user: {
                            email: "test email update",
                            password: "test password update",
                        }
                    ) {
                        id
                        email
                    }
                }
                `,
            });
        expect(res.body.errors[0].message).toEqual('Unauthorized');
    });

    it('should not delete user (permission denied)', async () => {
        const user = await getUser();
        const res = await request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
                mutation {
                    deleteUser(id: ${user.id}) {
                        id
                    }
                }
                `,
            });
        expect(res.body.errors[0].message).toEqual('Unauthorized');
    });

    describe('login as admin', () => {
        it('should get empty users', async () => {
            const res = await request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${await getAccessToken()}`)
                .send({
                    query: '{ users { id } }',
                });
            expect(res.body.data.users).toHaveLength(1);
        });

        it('should create user', async () => {
            const res = await request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${await getAccessToken()}`)
                .send({
                    query: `
                mutation {
                    createUser(
                        user: {
                            email: "test email",
                            password: "test password",
                            roles: ["user"]
                        }
                    ) {
                        id
                    }
                }
                `,
                });
            expect(res.status).toEqual(200);
            expect(res.body.data.createUser.id).toEqual(expect.any(String));
        });

        it('should get users', async () => {
            const res = await request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${await getAccessToken()}`)
                .send({
                    query: `{
                    users
                    {
                        id
                        email
                        password
                    }
                }`,
                });
            expect(res.status).toEqual(200);
            expect(res.body.data.users).toHaveLength(2);
            expect(res.body.data.users[1]).toEqual({
                id: expect.any(String),
                email: 'test email',
                password: expect.not.stringMatching('test password'),
            });
        });

        it('should get user by email', async () => {
            const res = await request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${await getAccessToken()}`)
                .send({
                    query: `{
                    userByEmail(email: "test email") {
                        id
                        email
                        password
                    }
                }`,
                });
            expect(res.status).toEqual(200);
            expect(res.body.data.userByEmail).toEqual({
                id: expect.any(String),
                email: 'test email',
                password: expect.not.stringMatching('test password'),
            });
        });

        it('should update user', async () => {
            const user = await getUser();
            const res = await request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${await getAccessToken()}`)
                .send({
                    query: `
                mutation {
                    updateUser(
                        id: ${user.id}
                        user: {
                            email: "test email update",
                            password: "test password update",
                        }
                    ) {
                        id
                        email
                    }
                }
                `,
                });
            expect(res.status).toEqual(200);
            expect(res.body.data.updateUser.email).toEqual('test email update');
        });

        it('should delete user', async () => {
            const user = await getUser();
            const res = await request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${await getAccessToken()}`)
                .send({
                    query: `
                mutation {
                    deleteUser(id: ${user.id}) {
                        id
                    }
                }
                `,
                });
            expect(res.status).toEqual(200);
            expect(+res.body.data.deleteUser.id).toEqual(user.id);
        });
    });
});
