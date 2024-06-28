import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
    let service: CryptoService;
    const password = 'password';
    const anotherPassword = 'anotherPassword';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CryptoService],
        }).compile();

        service = module.get<CryptoService>(CryptoService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should hash password', async () => {
        const hashedPassword = await service.hash(password);
        expect(hashedPassword).not.toEqual(password);
    });

    it('should compare password', async () => {
        const hashedPassword = await service.hash(password);
        const result = await service.compare(password, hashedPassword);
        expect(result).toEqual(true);
    });

    it('should not compare password', async () => {
        const hashedPassword = await service.hash(password);
        const result = await service.compare(anotherPassword, hashedPassword);
        expect(result).toEqual(false);
    });
});
