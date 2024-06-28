import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '@/shared/decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>(
            ROLES_KEY,
            context.getHandler(),
        );
        if (!roles) {
            return true;
        }
        const ctx = GqlExecutionContext.create(context);
        const user = ctx.getContext().req.user;
        return roles.some((role) => user.roles?.includes(role));
    }
}
