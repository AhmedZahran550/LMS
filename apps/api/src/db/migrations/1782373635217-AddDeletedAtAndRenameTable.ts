import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAtAndRenameTable1782373635217 implements MigrationInterface {
    name = 'AddDeletedAtAndRenameTable1782373635217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename table and constraints instead of dropping/recreating
        await queryRunner.query(`ALTER TABLE "video" RENAME TO "course_content"`);
        
        // Rename enum type
        await queryRunner.query(`ALTER TYPE "public"."video_contenttype_enum" RENAME TO "course_content_contenttype_enum"`);

        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "deletedAt" TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "notification"
            ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "notification"
            ADD "deletedAt" TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "log"
            ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "log"
            ADD "deletedAt" TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "course"
            ADD "deletedAt" TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "enrollment"
            ADD "deletedAt" TIMESTAMP
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "enrollment" DROP COLUMN "deletedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "course" DROP COLUMN "deletedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "log" DROP COLUMN "deletedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "log" DROP COLUMN "updatedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "notification" DROP COLUMN "deletedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "notification" DROP COLUMN "updatedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "deletedAt"
        `);
        
        await queryRunner.query(`ALTER TYPE "public"."course_content_contenttype_enum" RENAME TO "video_contenttype_enum"`);
        await queryRunner.query(`ALTER TABLE "course_content" RENAME TO "video"`);
    }

}
