import { Test, TestingModule } from '@nestjs/testing';
import { ShopInfoService } from './shop-info.service';

describe('ShopInfoService', () => {
  let service: ShopInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopInfoService],
    }).compile();

    service = module.get<ShopInfoService>(ShopInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
