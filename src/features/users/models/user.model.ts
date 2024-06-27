import { Role } from '@prisma/client';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserModel {
    @Field(() => ID)
    id: number;

    @Field()
    email: string;

    @Field()
    password: string;

    @Field(() => [String])
    roles: Role[];
}
