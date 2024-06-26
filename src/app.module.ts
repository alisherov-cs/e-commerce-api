import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { DatabaseModule } from '@/database/database.module';
import { ShopInfoResolver } from '@/features/shop-info/shop-info.resolver';
import { ShopInfoService } from '@/features/shop-info/shop-info.service';
import { ShopInfoModule } from '@/features/shop-info/shop-info.module';

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            playground: true,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        }),
        DatabaseModule,
        ShopInfoModule,
    ],
    providers: [ShopInfoResolver, ShopInfoService],
})
export class AppModule {}
