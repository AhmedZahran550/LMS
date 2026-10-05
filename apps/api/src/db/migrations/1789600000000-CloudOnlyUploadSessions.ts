import { MigrationInterface, QueryRunner } from "typeorm";

export class CloudOnlyUploadSessions1789600000000 implements MigrationInterface {
    name = 'CloudOnlyUploadSessions1789600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "upload_sessions" ALTER COLUMN "provider" SET DEFAULT 'cloudinary'`);
        await queryRunner.query(`UPDATE "upload_sessions" SET "provider" = 'cloudinary' WHERE "provider" = 'local'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "upload_sessions" ALTER COLUMN "provider" SET DEFAULT 'local'`);
    }
}
