import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesGuard,
                {
                    provide: Reflector,
                    useValue: {
                        get: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<RolesGuard>(RolesGuard);
        reflector = module.get<Reflector>(Reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should allow access if no roles are defined', () => {
        jest.spyOn(reflector, 'get').mockReturnValue(undefined);

        const context: ExecutionContext = {
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

        expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access if user has required roles', () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

        const context: ExecutionContext = {
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

        const mockContext: any = {
            getContext: jest.fn().mockReturnValue({
                req: { user: { roles: ['admin', 'user'] } },
            }),
        };

        jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockContext);

        expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access if user does not have required roles', () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

        const context: ExecutionContext = {
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

        const mockContext: any = {
            getContext: jest.fn().mockReturnValue({
                req: { user: { roles: ['user'] } },
            }),
        };

        jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockContext);

        expect(guard.canActivate(context)).toBe(false);
    });
});
