import { WeekDay } from '@prisma/client';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ShopInfoCreateModel {
    @Field()
    address: string;

    @Field()
    phoneNumber: string;

    @Field()
    email: string;

    @Field(() => [OpenAtCreateModel])
    openAt: OpenAtCreateModel[];

    @Field(() => [SocialMediaCreateModel])
    socialMedia: SocialMediaCreateModel[];
}

@InputType()
export class OpenAtCreateModel {
    @Field(() => String)
    weekDayFrom: WeekDay;

    @Field(() => String)
    weekDayTo: WeekDay;

    @Field(() => Date)
    timeFrom: Date;

    @Field(() => Date)
    timeTo: Date;
}

@InputType()
export class SocialMediaCreateModel {
    @Field()
    name: string;

    @Field()
    link: string;
}
