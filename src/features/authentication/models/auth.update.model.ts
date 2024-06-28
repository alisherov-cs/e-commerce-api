import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AuthUpdateModel {
    @Field({ nullable: true })
    email: string;

    @Field({ nullable: true })
    password: string;
}
