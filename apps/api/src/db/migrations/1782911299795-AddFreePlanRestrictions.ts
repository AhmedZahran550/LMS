import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFreePlanRestrictions1782911299795 implements MigrationInterface {
    name = 'AddFreePlanRestrictions1782911299795'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "hasUsedFreePlan" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "subscription_plan" ADD "durationDays" integer NOT NULL DEFAULT '180'`);

        // Set everyone who has had a free plan to hasUsedFreePlan = true
        await queryRunner.query(`
            UPDATE "user" 
            SET "hasUsedFreePlan" = true 
            WHERE id IN (
                SELECT DISTINCT "instructorId" 
                FROM instructor_subscription 
                JOIN subscription_plan ON instructor_subscription."planId" = subscription_plan.id 
                WHERE subscription_plan.name = 'free'
            )
        `);

        // Update all plans to use EGP
        await queryRunner.query(`UPDATE "subscription_plan" SET "currency" = 'egp'`);

        // Update specific plan parameters
        await queryRunner.query(`UPDATE "subscription_plan" SET "trialDays" = 30, "durationDays" = 30 WHERE "name" = 'free'`);
        await queryRunner.query(`UPDATE "subscription_plan" SET "price" = 12000, "pricePerStudent" = 120 WHERE "name" = 'pro'`);
        await queryRunner.query(`UPDATE "subscription_plan" SET "price" = 20000, "pricePerStudent" = 100 WHERE "name" = 'plus'`);
        await queryRunner.query(`UPDATE "subscription_plan" SET "price" = 35000, "pricePerStudent" = 70 WHERE "name" = 'enterprise'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_plan" DROP COLUMN "durationDays"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "hasUsedFreePlan"`);
    }

}
