import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUploadSessionsTable1789570000000 implements MigrationInterface {
    name = 'CreateUploadSessionsTable1789570000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."upload_sessions_status_enum" AS ENUM('pending', 'completed', 'aborted', 'expired')`);
        await queryRunner.query(`CREATE TABLE "upload_sessions" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            "deletedAt" TIMESTAMP,
            "instructorId" uuid NOT NULL,
            "courseId" uuid NOT NULL,
            "fileName" character varying NOT NULL,
            "fileSize" bigint NOT NULL,
            "mimeType" character varying NOT NULL,
            "folder" character varying NOT NULL DEFAULT 'courses',
            "publicId" character varying,
            "provider" character varying NOT NULL DEFAULT 'local',
            "status" "public"."upload_sessions_status_enum" NOT NULL DEFAULT 'pending',
            "uploadedBytes" bigint NOT NULL DEFAULT '0',
            "uploadParams" jsonb,
            "expiresAt" TIMESTAMP,
            CONSTRAINT "PK_upload_sessions_id" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`CREATE INDEX "IDX_upload_sessions_instructor_status" ON "upload_sessions" ("instructorId", "status")`);
        await queryRunner.query(`CREATE INDEX "IDX_upload_sessions_course_status" ON "upload_sessions" ("courseId", "status")`);
        await queryRunner.query(`ALTER TABLE "upload_sessions" ADD CONSTRAINT "FK_upload_sessions_instructor" FOREIGN KEY ("instructorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "upload_sessions" ADD CONSTRAINT "FK_upload_sessions_course" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "upload_sessions" DROP CONSTRAINT "FK_upload_sessions_course"`);
        await queryRunner.query(`ALTER TABLE "upload_sessions" DROP CONSTRAINT "FK_upload_sessions_instructor"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_upload_sessions_course_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_upload_sessions_instructor_status"`);
        await queryRunner.query(`DROP TABLE "upload_sessions"`);
        await queryRunner.query(`DROP TYPE "public"."upload_sessions_status_enum"`);
    }
}
