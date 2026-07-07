import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMobileNumberToUser1783300000000 implements MigrationInterface {
    name = 'AddMobileNumberToUser1783300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "mobileNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_9a2ac9c488737d97e7428841bb4" UNIQUE ("mobileNumber")`);
        await queryRunner.query(`ALTER TABLE "user" ADD "isMobileVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "mobileOtp" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "mobileOtpExpiresAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "mobileOtpExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "mobileOtp"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isMobileVerified"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_9a2ac9c488737d97e7428841bb4"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "mobileNumber"`);
    }

}
