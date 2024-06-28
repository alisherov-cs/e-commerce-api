import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@/shared/strategies/jwt.strategy';
import { UsersModule } from '@/features/users/users.module';
import { CryptoModule } from '@/shared/modules/crypto/crypto.module';
import { AuthenticationResolver } from './authentication.resolver';

@Module({
    imports: [
        UsersModule,
        CryptoModule,
        PassportModule,
        JwtModule.registerAsync({
            useFactory: async () => ({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '15m' },
            }),
        }),
    ],
    exports: [AuthenticationService],
    providers: [AuthenticationResolver, AuthenticationService, JwtStrategy],
})
export class AuthenticationModule {}
