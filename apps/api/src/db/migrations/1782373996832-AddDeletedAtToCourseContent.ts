import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAtToCourseContent1782373996832 implements MigrationInterface {
    name = 'AddDeletedAtToCourseContent1782373996832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "course_content" DROP CONSTRAINT "FK_1c9d48d197150678894ceb8afa5"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5cdb10a3a6804c21118a73335d"
        `);
        await queryRunner.query(`
            ALTER TABLE "course_content"
            ADD "deletedAt" TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "course_content"
            ADD "duration" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "course_content"
            ALTER COLUMN "orderIndex"
            SET DEFAULT '0'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_99dc0dfb79f3fd0f8dd203f5d9" ON "course_content" ("courseId", "orderIndex")
        `);
        await queryRunner.query(`
            ALTER TABLE "course_content"
            ADD CONSTRAINT "FK_f576cd9875b81147fa515f68b56" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "course_content" DROP CONSTRAINT "FK_f576cd9875b81147fa515f68b56"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_99dc0dfb79f3fd0f8dd203f5d9"
        `);
        await queryRunner.query(`
            ALTER TABLE "course_content"
            ALTER COLUMN "orderIndex" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "course_content" DROP COLUMN "duration"
        `);
        await queryRunner.query(`
            ALTER TABLE "course_content" DROP COLUMN "deletedAt"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5cdb10a3a6804c21118a73335d" ON "course_content" ("courseId", "orderIndex")
        `);
        await queryRunner.query(`
            ALTER TABLE "course_content"
            ADD CONSTRAINT "FK_1c9d48d197150678894ceb8afa5" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

}
