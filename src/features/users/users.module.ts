import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from '@/database/database.module';
import { UsersResolver } from './users.resolver';
import { CryptoModule } from '@/shared/modules/crypto/crypto.module';

@Module({
    imports: [DatabaseModule, CryptoModule],
    exports: [UsersService],
    providers: [UsersService, UsersResolver],
})
export class UsersModule {}
