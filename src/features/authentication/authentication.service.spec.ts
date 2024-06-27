import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/features/users/users.service';
import { CryptoService } from '@/shared/modules/crypto/crypto.service';

describe('AuthenticationService', () => {
    let service: AuthenticationService;
    let usersService: UsersService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthenticationService,
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn(),
                        sign: jest.fn(),
                    },
                },
                {
                    provide: UsersService,
                    useValue: {
                        findByEmail: jest.fn(),
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
});
