-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "ShopInfo" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "ShopInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenAt" (
    "id" SERIAL NOT NULL,
    "weekDayFrom" "WeekDay" NOT NULL,
    "weekDayTo" "WeekDay" NOT NULL,
    "timeFrom" TIMESTAMP(3) NOT NULL,
    "timeTo" TIMESTAMP(3) NOT NULL,
    "shopInfoId" INTEGER NOT NULL,

    CONSTRAINT "OpenAt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMedia" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "shopInfoId" INTEGER NOT NULL,

    CONSTRAINT "SocialMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OpenAt" ADD CONSTRAINT "OpenAt_shopInfoId_fkey" FOREIGN KEY ("shopInfoId") REFERENCES "ShopInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_shopInfoId_fkey" FOREIGN KEY ("shopInfoId") REFERENCES "ShopInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
