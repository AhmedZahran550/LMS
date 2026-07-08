import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPartialUniqueIndexOnMobileNumber1783500754915 implements MigrationInterface {
    name = 'AddPartialUniqueIndexOnMobileNumber1783500754915'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_9a2ac9c488737d97e7428841bb4"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_01fa0be9223045afde4be078dc" ON "user" ("mobileNumber") WHERE "isMobileVerified" = true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_01fa0be9223045afde4be078dc"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_9a2ac9c488737d97e7428841bb4" UNIQUE ("mobileNumber")`);
    }

}
