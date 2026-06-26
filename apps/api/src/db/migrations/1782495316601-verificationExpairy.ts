import { MigrationInterface, QueryRunner } from "typeorm";

export class VerificationExpairy1782495316601 implements MigrationInterface {
    name = 'VerificationExpairy1782495316601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "log" ADD "requestId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "log" DROP COLUMN "requestId"`);
    }

}
