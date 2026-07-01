import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePlanPricing1783000000000 implements MigrationInterface {
    name = 'UpdatePlanPricing1783000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."subscription_plan_name_enum" ADD VALUE 'enterprise'`);

        await queryRunner.query(`ALTER TABLE "subscription_plan" DROP COLUMN "maxCourses"`);

        await queryRunner.query(`ALTER TABLE "subscription_plan" RENAME COLUMN "maxStorageBytes" TO "baseStorageBytes"`);

        await queryRunner.query(`ALTER TABLE "subscription_plan" ADD "pricePerStudent" integer NOT NULL DEFAULT '0'`);

        // Update existing plan data
        await queryRunner.query(`UPDATE "subscription_plan" SET "maxTotalStudents" = 5, "pricePerStudent" = 0, "baseStorageBytes" = 2147483648, "price" = 0, "description" = 'Free plan with 2GB storage and up to 5 students.' WHERE "name" = 'free'`);

        await queryRunner.query(`UPDATE "subscription_plan" SET "maxTotalStudents" = 100, "pricePerStudent" = 120, "baseStorageBytes" = 10737418240, "price" = 12000, "description" = 'Pro plan with 10GB storage and up to 100 students.' WHERE "name" = 'pro'`);

        await queryRunner.query(`UPDATE "subscription_plan" SET "maxTotalStudents" = 200, "pricePerStudent" = 100, "baseStorageBytes" = 10737418240, "price" = 20000, "description" = 'Plus plan with 10GB storage and up to 200 students.' WHERE "name" = 'plus'`);

        // Insert enterprise plan
        await queryRunner.query(`INSERT INTO "subscription_plan" ("name", "description", "price", "currency", "maxTotalStudents", "pricePerStudent", "baseStorageBytes", "trialDays", "stripePriceId", "isActive") VALUES ('enterprise', 'Enterprise plan with 10GB storage and up to 500 students.', 35000, 'usd', 500, 70, 10737418240, 0, NULL, true)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "subscription_plan" WHERE "name" = 'enterprise'`);

        await queryRunner.query(`UPDATE "subscription_plan" SET "maxTotalStudents" = 0, "pricePerStudent" = 0, "baseStorageBytes" = 0, "price" = 0, "description" = '' WHERE "name" = 'plus'`);

        await queryRunner.query(`UPDATE "subscription_plan" SET "maxTotalStudents" = 0, "pricePerStudent" = 0, "baseStorageBytes" = 0, "price" = 0, "description" = '' WHERE "name" = 'pro'`);

        await queryRunner.query(`UPDATE "subscription_plan" SET "maxTotalStudents" = 0, "pricePerStudent" = 0, "baseStorageBytes" = 0, "price" = 0, "description" = '' WHERE "name" = 'free'`);

        await queryRunner.query(`ALTER TABLE "subscription_plan" DROP COLUMN "pricePerStudent"`);

        await queryRunner.query(`ALTER TABLE "subscription_plan" RENAME COLUMN "baseStorageBytes" TO "maxStorageBytes"`);

        await queryRunner.query(`ALTER TABLE "subscription_plan" ADD "maxCourses" integer NOT NULL DEFAULT '0'`);
    }
}
