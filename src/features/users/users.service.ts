import { DatabaseService } from '@/database/database.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserCreateModel } from './models/user.create.model';
import { UserUpdateModel } from './models/user.update.model';
import { CryptoService } from '@/shared/modules/crypto/crypto.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly db: DatabaseService,
        private readonly crypto: CryptoService,
    ) {}

    async getUsers(): Promise<User[]> {
        return await this.db.user.findMany();
    }

    async getUserById(id: number): Promise<User> {
        try {
            return await this.db.user.findUniqueOrThrow({ where: { id } });
        } catch {
            throw new NotFoundException("User doesn't exist");
        }
    }

    async getUserByEmail(email: string): Promise<User> {
        try {
            return await this.db.user.findUniqueOrThrow({ where: { email } });
        } catch {
            throw new NotFoundException("User doesn't exist");
        }
    }

    async createUser(user: UserCreateModel): Promise<User> {
        return await this.db.user.create({
            data: { ...user, password: await this.crypto.hash(user.password) },
        });
    }

    async updateUser(id: number, user: UserUpdateModel): Promise<User> {
        if (user.password) {
            return await this.db.user.update({
                where: { id },
                data: {
                    ...user,
                    password: await this.crypto.hash(user.password),
                },
            });
        }
        return await this.db.user.update({ where: { id }, data: user });
    }

    async deleteUser(id: number): Promise<User> {
        return await this.db.user.delete({ where: { id } });
    }
}
