import { Role } from '@prisma/client';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserUpdateModel {
    @Field({ nullable: true })
    email: string;

    @Field({ nullable: true })
    password: string;

    @Field(() => [String], { nullable: true })
    roles: Role[];
}
