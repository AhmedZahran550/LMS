import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserPreferences1782437685030 implements MigrationInterface {
    name = 'AddUserPreferences1782437685030'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "preferences" jsonb NOT NULL DEFAULT '{"lang":"ar","mode":"light"}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "preferences"`);
    }

}
