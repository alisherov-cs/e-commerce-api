import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserModel } from './models/user.model';
import { UserCreateModel } from './models/user.create.model';
import { UserUpdateModel } from './models/user.update.model';
import { UseGuards } from '@nestjs/common';
import { JWTAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/role.decorator';

@Resolver()
export class UsersResolver {
    constructor(private readonly usersService: UsersService) {}

    @Query(() => [UserModel])
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles('admin')
    async users(@Context() _: any) {
        return await this.usersService.getUsers();
    }

    @Query(() => UserModel)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles('admin')
    async userById(@Args('id') id: number) {
        return await this.usersService.getUserById(id);
    }

    @Query(() => UserModel)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles('admin')
    async userByEmail(@Args('email') email: string) {
        return await this.usersService.getUserByEmail(email);
    }

    @Mutation(() => UserModel)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles('admin')
    async createUser(@Args('user') user: UserCreateModel) {
        return await this.usersService.createUser(user);
    }

    @Mutation(() => UserModel)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles('admin')
    async updateUser(
        @Args('id') id: number,
        @Args('user') user: UserUpdateModel,
    ) {
        return await this.usersService.updateUser(id, user);
    }

    @Mutation(() => UserModel)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles('admin')
    async deleteUser(@Args('id') id: number) {
        return await this.usersService.deleteUser(id);
    }
}
