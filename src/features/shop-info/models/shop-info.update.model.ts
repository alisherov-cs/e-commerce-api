import { WeekDay } from '@prisma/client';
import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class ShopInfoUpdateModel {
    @Field({ nullable: true })
    address: string;

    @Field({ nullable: true })
    phoneNumber: string;

    @Field({ nullable: true })
    email: string;

    @Field(() => [OpenAtUpdateModel], { nullable: true })
    openAt: OpenAtUpdateModel[];

    @Field(() => [SocialMediaUpdateModel], { nullable: true })
    socialMedia: SocialMediaUpdateModel[];
}

@InputType()
export class OpenAtUpdateModel {
    @Field(() => ID)
    id: number;

    @Field(() => String, { nullable: true })
    weekDayFrom: WeekDay;

    @Field(() => String, { nullable: true })
    weekDayTo: WeekDay;

    @Field(() => Date, { nullable: true })
    timeFrom: Date;

    @Field(() => Date, { nullable: true })
    timeTo: Date;
}

@InputType()
export class SocialMediaUpdateModel {
    @Field(() => ID)
    id: number;

    @Field({ nullable: true })
    name: string;

    @Field({ nullable: true })
    link: string;
}
