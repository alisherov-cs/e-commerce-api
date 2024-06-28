import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/features/users/users.service';
import { CryptoService } from '@/shared/modules/crypto/crypto.service';
import { User } from '@prisma/client';
import { AuthCreateModel } from './models/auth.create.model';
import { Role } from '@prisma/client';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly crypto: CryptoService,
    ) {}

    async register(user: AuthCreateModel) {
        const newUser = await this.usersService.createUser({
            email: user.email,
            password: user.password,
            roles: ['user'],
        });

        const payload = {
            email: newUser.email,
            sub: newUser.id,
            roles: newUser.roles,
        };

        return {
            access_token: await this.jwtService.signAsync(payload),
            refresh_token: await this.generateRefreshToken(
                newUser.email,
                newUser.id,
                newUser.roles,
            ),
        };
    }

    async registerAdmin(user: AuthCreateModel) {
        const newUser = await this.usersService.createUser({
            email: user.email,
            password: user.password,
            roles: ['admin'],
        });

        const payload = {
            email: newUser.email,
            sub: newUser.id,
            roles: newUser.roles,
        };

        return {
            access_token: await this.jwtService.signAsync(payload),
            refresh_token: await this.generateRefreshToken(
                newUser.email,
                newUser.id,
                newUser.roles,
            ),
        };
    }

    async login(user: AuthCreateModel) {
        const existingUser = await this.usersService.getUserByEmail(user.email);
        const passwordMatch = await this.crypto.compare(
            user.password,
            existingUser.password,
        );

        if (!passwordMatch) {
            throw new UnauthorizedException();
        }

        const payload = {
            email: existingUser.email,
            sub: existingUser.id,
            roles: existingUser.roles,
        };

        return {
            access_token: await this.jwtService.signAsync(payload),
            refresh_token: await this.generateRefreshToken(
                existingUser.email,
                existingUser.id,
                existingUser.roles,
            ),
        };
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.usersService.getUserByEmail(email);

        if (user && (await this.crypto.compare(password, user.password))) {
            return user;
        }

        return null;
    }

    async generateRefreshToken(email: string, id: number, roles: Role[]) {
        const payload = { email, sub: id, roles };

        return await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });
    }

    async refresh(refreshToken: string) {
        try {
            const decoded = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });

            const payload = {
                email: decoded.email,
                sub: decoded.sub,
                roles: decoded.roles,
            };

            return {
                access_token: await this.jwtService.signAsync(payload),
            };
        } catch (e) {
            throw new UnauthorizedException();
        }
    }
}
