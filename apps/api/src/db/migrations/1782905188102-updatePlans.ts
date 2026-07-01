import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePlans1782905188102 implements MigrationInterface {
    name = 'UpdatePlans1782905188102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_plan" RENAME COLUMN "maxStudentsPerCourse" TO "maxTotalStudents"`);
        await queryRunner.query(`CREATE TABLE "system_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "key" character varying NOT NULL, "value" text NOT NULL, "description" text, CONSTRAINT "UQ_eedd3cd0f227c7fb5eff2204e93" UNIQUE ("key"), CONSTRAINT "PK_db4e70ac0d27e588176e9bb44a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "storage_addon" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "instructorSubscriptionId" uuid NOT NULL, "additionalBytes" bigint NOT NULL, "stripePriceId" character varying, "stripeInvoiceId" character varying, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_4eb1ea24493d3ef6b396fc89844" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."instructor_student_status_enum" AS ENUM('invited', 'requested', 'active', 'removed')`);
        await queryRunner.query(`CREATE TYPE "public"."instructor_student_invitedby_enum" AS ENUM('instructor', 'student')`);
        await queryRunner.query(`CREATE TABLE "instructor_student" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "instructorId" uuid NOT NULL, "studentId" uuid NOT NULL, "status" "public"."instructor_student_status_enum" NOT NULL DEFAULT 'invited', "invitedBy" "public"."instructor_student_invitedby_enum" NOT NULL DEFAULT 'instructor', "invitationToken" character varying, "invitationSentAt" TIMESTAMP, "respondedAt" TIMESTAMP, CONSTRAINT "PK_ca262f9ef74e6077a74bbd21692" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_aae0e771dab65e5dfc5b505087" ON "instructor_student" ("instructorId", "studentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_190a6a62ade012e5801faffd29" ON "instructor_student" ("studentId", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_327112d9aa7de8e468a049cf3c" ON "instructor_student" ("instructorId", "status") `);
        await queryRunner.query(`CREATE TABLE "course_assignment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "instructorStudentId" uuid NOT NULL, "courseId" uuid NOT NULL, "assignedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cb00045f4241987555bbd4b4589" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0ea961aae7817cbf26ed62e3ce" ON "course_assignment" ("instructorStudentId", "courseId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e708883b96f046f6f04fa683e2" ON "course_assignment" ("courseId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c0f309a050e4050a3d50091d3a" ON "course_assignment" ("instructorStudentId") `);
        await queryRunner.query(`ALTER TABLE "storage_addon" ADD CONSTRAINT "FK_c43a32d14ea77d37b82ed72ca1d" FOREIGN KEY ("instructorSubscriptionId") REFERENCES "instructor_subscription"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "instructor_student" ADD CONSTRAINT "FK_9593392fb33ad769b51296e13fa" FOREIGN KEY ("instructorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "instructor_student" ADD CONSTRAINT "FK_0afb2754e5c05931588eef10eb6" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_assignment" ADD CONSTRAINT "FK_c0f309a050e4050a3d50091d3af" FOREIGN KEY ("instructorStudentId") REFERENCES "instructor_student"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_assignment" ADD CONSTRAINT "FK_e708883b96f046f6f04fa683e20" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_assignment" DROP CONSTRAINT "FK_e708883b96f046f6f04fa683e20"`);
        await queryRunner.query(`ALTER TABLE "course_assignment" DROP CONSTRAINT "FK_c0f309a050e4050a3d50091d3af"`);
        await queryRunner.query(`ALTER TABLE "instructor_student" DROP CONSTRAINT "FK_0afb2754e5c05931588eef10eb6"`);
        await queryRunner.query(`ALTER TABLE "instructor_student" DROP CONSTRAINT "FK_9593392fb33ad769b51296e13fa"`);
        await queryRunner.query(`ALTER TABLE "storage_addon" DROP CONSTRAINT "FK_c43a32d14ea77d37b82ed72ca1d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c0f309a050e4050a3d50091d3a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e708883b96f046f6f04fa683e2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0ea961aae7817cbf26ed62e3ce"`);
        await queryRunner.query(`DROP TABLE "course_assignment"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_327112d9aa7de8e468a049cf3c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_190a6a62ade012e5801faffd29"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aae0e771dab65e5dfc5b505087"`);
        await queryRunner.query(`DROP TABLE "instructor_student"`);
        await queryRunner.query(`DROP TYPE "public"."instructor_student_invitedby_enum"`);
        await queryRunner.query(`DROP TYPE "public"."instructor_student_status_enum"`);
        await queryRunner.query(`DROP TABLE "storage_addon"`);
        await queryRunner.query(`DROP TABLE "system_config"`);
        await queryRunner.query(`ALTER TABLE "subscription_plan" RENAME COLUMN "maxTotalStudents" TO "maxStudentsPerCourse"`);
    }

}
