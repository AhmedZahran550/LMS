import { MigrationInterface, QueryRunner } from "typeorm";

export class AddErrorToLog1782496305988 implements MigrationInterface {
    name = 'AddErrorToLog1782496305988'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "log" ADD "error" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "log" DROP COLUMN "error"`);
    }

}
