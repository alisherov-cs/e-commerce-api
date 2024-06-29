import { Role } from '@prisma/client';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserCreateModel {
    @Field()
    email: string;

    @Field()
    password: string;

    @Field(() => [String])
    roles: Role[];
}
