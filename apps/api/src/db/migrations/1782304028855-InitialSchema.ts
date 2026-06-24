import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1782304028855 implements MigrationInterface {
    name = 'InitialSchema1782304028855'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'instructor', 'learner')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'learner', "isActive" boolean NOT NULL DEFAULT true, "hashedRefreshToken" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."course_visibility_enum" AS ENUM('public', 'private')`);
        await queryRunner.query(`CREATE TABLE "course" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "visibility" "public"."course_visibility_enum" NOT NULL DEFAULT 'private', "thumbnailUrl" character varying, "isActive" boolean NOT NULL DEFAULT true, "instructorId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_32d94af473bb59d808d9a68e17" ON "course" ("instructorId") `);
        await queryRunner.query(`CREATE TABLE "video" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "url" character varying NOT NULL, "filename" character varying NOT NULL, "mimeType" character varying NOT NULL, "size" integer NOT NULL, "orderIndex" integer NOT NULL, "courseId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1a2f3856250765d72e7e1636c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5cdb10a3a6804c21118a73335d" ON "video" ("courseId", "orderIndex") `);
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('new_content', 'enrollment_request', 'enrollment_response')`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "subject" character varying NOT NULL, "message" text NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "type" "public"."notification_type_enum" NOT NULL, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ea34abc69625e58f67007481e1" ON "notification" ("userId", "isRead") `);
        await queryRunner.query(`CREATE TYPE "public"."enrollment_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "enrollment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "learnerId" uuid NOT NULL, "courseId" uuid NOT NULL, "status" "public"."enrollment_status_enum" NOT NULL DEFAULT 'pending', "requestedAt" TIMESTAMP NOT NULL DEFAULT now(), "respondedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e200c699fa93865cdcdd025885" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_78db8d624ea6a05a1fe03dbf4e" ON "enrollment" ("learnerId", "courseId") `);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "FK_32d94af473bb59d808d9a68e17b" FOREIGN KEY ("instructorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "video" ADD CONSTRAINT "FK_1c9d48d197150678894ceb8afa5" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollment" ADD CONSTRAINT "FK_10ddff28bdac4ecf45eecedadfb" FOREIGN KEY ("learnerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollment" ADD CONSTRAINT "FK_d1a599a7740b4f4bd1120850f04" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "enrollment" DROP CONSTRAINT "FK_d1a599a7740b4f4bd1120850f04"`);
        await queryRunner.query(`ALTER TABLE "enrollment" DROP CONSTRAINT "FK_10ddff28bdac4ecf45eecedadfb"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`);
        await queryRunner.query(`ALTER TABLE "video" DROP CONSTRAINT "FK_1c9d48d197150678894ceb8afa5"`);
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_32d94af473bb59d808d9a68e17b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_78db8d624ea6a05a1fe03dbf4e"`);
        await queryRunner.query(`DROP TABLE "enrollment"`);
        await queryRunner.query(`DROP TYPE "public"."enrollment_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ea34abc69625e58f67007481e1"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5cdb10a3a6804c21118a73335d"`);
        await queryRunner.query(`DROP TABLE "video"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_32d94af473bb59d808d9a68e17"`);
        await queryRunner.query(`DROP TABLE "course"`);
        await queryRunner.query(`DROP TYPE "public"."course_visibility_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
