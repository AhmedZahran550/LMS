import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContentTypeToVideo1782371989754 implements MigrationInterface {
    name = 'AddContentTypeToVideo1782371989754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."video_contenttype_enum" AS ENUM('video', 'pdf', 'image', 'presentation')
        `);
        await queryRunner.query(`
            ALTER TABLE "video"
            ADD "contentType" "public"."video_contenttype_enum" NOT NULL DEFAULT 'video'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "video" DROP COLUMN "contentType"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."video_contenttype_enum"
        `);
    }

}
