import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { DatabaseModule } from '@/database/database.module';
import { ShopInfoResolver } from '@/features/shop-info/shop-info.resolver';
import { ShopInfoModule } from '@/features/shop-info/shop-info.module';
import { AuthenticationModule } from '@/features/authentication/authentication.module';
import { UsersModule } from '@/features/users/users.module';
import { CryptoModule } from '@/shared/modules/crypto/crypto.module';
import { UsersResolver } from '@/features/users/users.resolver';
import { AuthenticationResolver } from '@/features/authentication/authentication.resolver';
import { ShopInfoService } from '@/features/shop-info/shop-info.service';

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            playground: true,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            context: ({ req }) => ({ req }),
        }),
        DatabaseModule,
        ShopInfoModule,
        AuthenticationModule,
        UsersModule,
        CryptoModule,
    ],
    providers: [
        ShopInfoResolver,
        ShopInfoService,
        UsersResolver,
        AuthenticationResolver,
    ],
})
export class AppModule {}
