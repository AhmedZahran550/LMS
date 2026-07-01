import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDurationMonthsToPlan1782912516409 implements MigrationInterface {
    name = 'AddDurationMonthsToPlan1782912516409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_plan" ADD "durationMonths" integer NOT NULL DEFAULT '6'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_plan" DROP COLUMN "durationMonths"`);
    }

}
