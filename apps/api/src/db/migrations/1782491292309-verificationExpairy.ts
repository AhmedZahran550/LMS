import { MigrationInterface, QueryRunner } from "typeorm";

export class VerificationExpairy1782491292309 implements MigrationInterface {
    name = 'VerificationExpairy1782491292309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "emailVerificationOtpExpiresAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emailVerificationOtpExpiresAt"`);
    }

}
