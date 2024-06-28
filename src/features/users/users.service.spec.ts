import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '@/database/database.service';
import { CryptoService } from '@/shared/modules/crypto/crypto.service';
import { User } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
    let service: UsersService;
    let dbService: DatabaseService;

    const mockUsers: User[] = [
        {
            id: 1,
            email: 'email',
            password: 'password',
            roles: ['admin'],
        },
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
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

        service = module.get<UsersService>(UsersService);
        dbService = module.get<DatabaseService>(DatabaseService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should get users', async () => {
        (dbService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
        const users = await service.getUsers();
        expect(users).toEqual(mockUsers);
    });

    it('should get user by id', async () => {
        (dbService.user.findUniqueOrThrow as jest.Mock).mockResolvedValue(
            mockUsers[0],
        );
        const user = await service.getUserById(1);
        expect(user).toEqual(mockUsers[0]);
    });

    it('should not get user by id', async () => {
        (dbService.user.findUniqueOrThrow as jest.Mock).mockRejectedValue(
            new Error(),
        );
        await expect(service.getUserById(1)).rejects.toThrow(NotFoundException);
    });

    it('should get user by email', async () => {
        (dbService.user.findUniqueOrThrow as jest.Mock).mockResolvedValue(
            mockUsers[0],
        );
        const user = await service.getUserByEmail('email');
        expect(user).toEqual(mockUsers[0]);
    });

    it('should create user', async () => {
        (dbService.user.create as jest.Mock).mockResolvedValue(mockUsers[0]);
        const user = await service.createUser({
            email: 'email',
            password: 'password',
            roles: ['admin'],
        });
        expect(user).toEqual(mockUsers[0]);
    });

    it('should update user', async () => {
        (dbService.user.update as jest.Mock).mockResolvedValue(mockUsers[0]);
        const user = await service.updateUser(1, {
            email: 'email',
            password: 'password',
            roles: ['admin'],
        });
        expect(user).toEqual(mockUsers[0]);
    });

    it('should delete user', async () => {
        (dbService.user.delete as jest.Mock).mockResolvedValue(mockUsers[0]);
        const user = await service.deleteUser(1);
        expect(user).toEqual(mockUsers[0]);
    });
});
