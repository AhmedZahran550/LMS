import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeStudentIdNullable1783543257729 implements MigrationInterface {
    name = 'MakeStudentIdNullable1783543257729'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_aae0e771dab65e5dfc5b505087"`);
        await queryRunner.query(`ALTER TABLE "instructor_student" ADD "invitedEmail" character varying`);
        await queryRunner.query(`ALTER TABLE "instructor_student" DROP CONSTRAINT "FK_0afb2754e5c05931588eef10eb6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_190a6a62ade012e5801faffd29"`);
        await queryRunner.query(`ALTER TABLE "instructor_student" ALTER COLUMN "studentId" DROP NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ce72a840dd69fd98ac3fbd7eed" ON "instructor_student" ("instructorId", "studentId") WHERE "studentId" IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_190a6a62ade012e5801faffd29" ON "instructor_student" ("studentId", "status") `);
        await queryRunner.query(`ALTER TABLE "instructor_student" ADD CONSTRAINT "FK_0afb2754e5c05931588eef10eb6" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "instructor_student" DROP CONSTRAINT "FK_0afb2754e5c05931588eef10eb6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_190a6a62ade012e5801faffd29"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ce72a840dd69fd98ac3fbd7eed"`);
        await queryRunner.query(`ALTER TABLE "instructor_student" ALTER COLUMN "studentId" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_190a6a62ade012e5801faffd29" ON "instructor_student" ("status", "studentId") `);
        await queryRunner.query(`ALTER TABLE "instructor_student" ADD CONSTRAINT "FK_0afb2754e5c05931588eef10eb6" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "instructor_student" DROP COLUMN "invitedEmail"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_aae0e771dab65e5dfc5b505087" ON "instructor_student" ("instructorId", "studentId") `);
    }

}
