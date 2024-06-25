import { Test, TestingModule } from '@nestjs/testing';
import { ShopInfoResolver } from './shop-info.resolver';

describe('ShopInfoResolver', () => {
  let resolver: ShopInfoResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopInfoResolver],
    }).compile();

    resolver = module.get<ShopInfoResolver>(ShopInfoResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
