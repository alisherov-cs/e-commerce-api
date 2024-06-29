import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AuthCreateModel {
    @Field()
    email: string;

    @Field()
    password: string;
}
