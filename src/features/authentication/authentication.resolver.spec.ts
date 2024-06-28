import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationResolver } from './authentication.resolver';
import { AuthenticationService } from './authentication.service';
import { CryptoService } from '@/shared/modules/crypto/crypto.service';

describe('AuthenticationResolver', () => {
    let resolver: AuthenticationResolver;
    let service: AuthenticationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthenticationResolver,
                {
                    provide: AuthenticationService,
                    useValue: {
                        login: jest.fn(),
                        register: jest.fn(),
                        registerAdmin: jest.fn(),
                        refresh: jest.fn(),
                    },
                },
                {
                    provide: CryptoService,
                    useValue: { hash: jest.fn(), compare: jest.fn() },
                },
            ],
        }).compile();

        resolver = module.get<AuthenticationResolver>(AuthenticationResolver);
        service = module.get<AuthenticationService>(AuthenticationService);
    });

    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });

    it('should login', async () => {
        (service.login as jest.Mock).mockResolvedValue({
            access_token: 'access_token',
            refresh_token: 'refresh_token',
        });
        const res = await resolver.login({
            email: 'email',
            password: 'password',
        });
        expect(res).toEqual({
            access_token: 'access_token',
            refresh_token: 'refresh_token',
        });
    });

    it('should register', async () => {
        (service.register as jest.Mock).mockResolvedValue({
            access_token: 'access_token',
            refresh_token: 'refresh_token',
        });
        const res = await resolver.register({
            email: 'email',
            password: 'password',
        });
        expect(res).toEqual({
            access_token: 'access_token',
            refresh_token: 'refresh_token',
        });
    });

    it('should register admin', async () => {
        (service.registerAdmin as jest.Mock).mockResolvedValue({
            access_token: 'access_token',
            refresh_token: 'refresh_token',
        });
        const res = await resolver.registerAdmin({
            email: 'email',
            password: 'password',
        });
        expect(res).toEqual({
            access_token: 'access_token',
            refresh_token: 'refresh_token',
        });
    });

    it('should refresh token', async () => {
        (service.refresh as jest.Mock).mockResolvedValue({
            access_token: 'access_token',
        });
        const res = await resolver.refresh('refresh_token');
        expect(res).toEqual({
            access_token: 'access_token',
        });
    });
});
