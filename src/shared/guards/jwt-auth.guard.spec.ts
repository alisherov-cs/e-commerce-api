import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { JWTAuthGuard } from './jwt-auth.guard';

describe('JWTAuthGuard', () => {
    let guard: JWTAuthGuard;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JWTAuthGuard],
        }).compile();

        guard = module.get<JWTAuthGuard>(JWTAuthGuard);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should extract request from GraphQL context', () => {
        const mockContext: any = {
            getContext: jest.fn().mockReturnValue({
                req: { headers: { authorization: 'Bearer token' } },
            }),
        };

        const executionContext: ExecutionContext = {
            getType: jest.fn().mockReturnValue('graphql'),
            switchToHttp: jest.fn(),
            switchToRpc: jest.fn(),
            switchToWs: jest.fn(),
            getArgs: jest.fn(),
            getArgByIndex: jest.fn(),
            getClass: jest.fn(),
            getHandler: jest.fn(),
            getArgsByType: jest.fn(),
        } as unknown as ExecutionContext;

        jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockContext);

        const request = guard.getRequest(executionContext);
        expect(request).toEqual({ headers: { authorization: 'Bearer token' } });
    });
});
