import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthenticationService } from './authentication.service';
import { AuthModel } from './models/auth.model';
import { AuthCreateModel } from './models/auth.create.model';
import { UseGuards } from '@nestjs/common';
import { JWTAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/role.decorator';

@Resolver()
export class AuthenticationResolver {
    constructor(
        private readonly authenticationService: AuthenticationService,
    ) {}

    @Mutation(() => AuthModel)
    async login(@Args('auth') auth: AuthCreateModel) {
        return await this.authenticationService.login(auth);
    }

    @Mutation(() => AuthModel)
    async register(@Args('auth') auth: AuthCreateModel) {
        return await this.authenticationService.register(auth);
    }

    @Mutation(() => AuthModel)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles('admin')
    async registerAdmin(@Args('auth') auth: AuthCreateModel) {
        return await this.authenticationService.registerAdmin(auth);
    }

    @Mutation(() => AuthModel)
    async refresh(@Args('refreshToken') refreshToken: string) {
        return await this.authenticationService.refresh(refreshToken);
    }
}
