import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/features/users/users.service';
import { CryptoService } from '@/shared/modules/crypto/crypto.service';

describe('AuthenticationService', () => {
    let service: AuthenticationService;
    let usersService: UsersService;
    let jwtService: JwtService;
    let cryptoService: CryptoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthenticationService,
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn(),
                        sign: jest.fn(),
                        verify: jest.fn(),
                    },
                },
                {
                    provide: UsersService,
                    useValue: {
                        getUserByEmail: jest.fn(),
                        createUser: jest.fn(),
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

        service = module.get<AuthenticationService>(AuthenticationService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
        cryptoService = module.get<CryptoService>(CryptoService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should register user', async () => {
        (usersService.createUser as jest.Mock).mockResolvedValue({
            id: 1,
            email: 'email',
            roles: ['user'],
        });
        (jwtService.signAsync as jest.Mock).mockResolvedValue('access_token');
        const res = await service.register({
            email: 'email',
            password: 'password',
        });
        expect(res).toEqual({
            access_token: 'access_token',
            refresh_token: 'access_token',
        });
    });

    it('should login user', async () => {
        (usersService.getUserByEmail as jest.Mock).mockResolvedValue({
            id: 1,
            email: 'email',
            password: await cryptoService.hash('password'),
            roles: ['user'],
        });
        (cryptoService.compare as jest.Mock).mockResolvedValue(true);
        (jwtService.signAsync as jest.Mock).mockResolvedValue('access_token');
        const res = await service.login({
            email: 'email',
            password: 'password',
        });
        expect(res).toEqual({
            access_token: 'access_token',
            refresh_token: 'access_token',
        });
    });

    it('should register admin', async () => {
        (usersService.createUser as jest.Mock).mockResolvedValue({
            id: 1,
            email: 'email',
            roles: ['admin'],
        });
        (jwtService.signAsync as jest.Mock).mockResolvedValue('access_token');
        const res = await service.registerAdmin({
            email: 'email',
            password: 'password',
        });
        expect(res).toEqual({
            access_token: 'access_token',
            refresh_token: 'access_token',
        });
    });

    it('should refresh token', async () => {
        (jwtService.verify as jest.Mock).mockResolvedValue({
            email: 'email',
            sub: 1,
            roles: ['user'],
        });
        (jwtService.signAsync as jest.Mock).mockResolvedValue('access_token');
        const res = await service.refresh('refresh_token');
        expect(res).toEqual({
            access_token: 'access_token',
        });
    });

    it('should generate refresh token', async () => {
        (jwtService.signAsync as jest.Mock).mockResolvedValue('refresh_token');
        const res = await service.generateRefreshToken('email', 1, ['user']);
        expect(res).toEqual('refresh_token');
    });
});
