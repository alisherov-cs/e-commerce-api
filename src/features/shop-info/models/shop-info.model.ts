import { Field, ID, ObjectType } from '@nestjs/graphql';
import { WeekDay } from '@/shared/enums/weekDays.enum';

@ObjectType()
export class ShopInfoModel {
    @Field(() => ID)
    id: number;

    @Field()
    address: string;

    @Field()
    phoneNumber: string;

    @Field()
    email: string;

    @Field(() => [OpenAtModel])
    openAt: OpenAtModel[];

    @Field(() => [SocialMediaModel])
    socialMedia: SocialMediaModel[];
}

@ObjectType()
export class OpenAtModel {
    @Field(() => ID)
    id: number;

    @Field(() => WeekDay)
    weekDayFrom: WeekDay;

    @Field(() => WeekDay)
    weekDayTo: WeekDay;

    @Field(() => Date)
    timeFrom: Date;

    @Field(() => Date)
    timeTo: Date;
}

@ObjectType()
export class SocialMediaModel {
    @Field(() => ID)
    id: number;

    @Field()
    name: string;

    @Field()
    link: string;
}
