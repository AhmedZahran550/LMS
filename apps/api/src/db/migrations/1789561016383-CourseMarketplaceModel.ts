import { MigrationInterface, QueryRunner } from "typeorm";

export class CourseMarketplaceModel1789561016383 implements MigrationInterface {
    name = 'CourseMarketplaceModel1789561016383'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "universities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "nameAr" character varying NOT NULL, "faculties" jsonb NOT NULL DEFAULT '[]', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_25b08a78732a663bb35872eaa70" UNIQUE ("name"), CONSTRAINT "PK_8da52f2cee6b407559fdbabf59e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_25b08a78732a663bb35872eaa7" ON "universities" ("name") `);
        await queryRunner.query(`CREATE TABLE "storage_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "nameAr" character varying, "gigabytes" integer NOT NULL, "price" numeric(10,2) NOT NULL DEFAULT '0', "currency" character varying NOT NULL DEFAULT 'egp', "durationDays" integer NOT NULL DEFAULT '90', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_2c70ce9d309dddc24732234b6c4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."storage_subscriptions_status_enum" AS ENUM('active', 'expired', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "storage_subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "instructorId" uuid NOT NULL, "storagePlanId" uuid NOT NULL, "status" "public"."storage_subscriptions_status_enum" NOT NULL DEFAULT 'active', "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "kashierOrderId" character varying, "kashierPaymentId" character varying, CONSTRAINT "PK_56c0f8914bd87ca5e3cf507e1dd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_74bbd07d22fb681932171cd1b4" ON "storage_subscriptions" ("kashierOrderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e2879a4cdd5422e1b71efb8f5d" ON "storage_subscriptions" ("instructorId", "status") `);
        await queryRunner.query(`CREATE TABLE "storage_addons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "instructorId" uuid NOT NULL, "additionalBytes" bigint NOT NULL, "kashierOrderId" character varying, "kashierPaymentId" character varying, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_b69b217b47da7817ffe3a24d4dc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c4cca10935ec8576fb1b587e81" ON "storage_addons" ("kashierOrderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_17d2e158329a542311afe8de07" ON "storage_addons" ("instructorId", "isActive") `);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "nameAr" character varying NOT NULL, "slug" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8b0be371d28245da6e4f4b6187" ON "categories" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_420d9f679d41281f282f5bc7d0" ON "categories" ("slug") `);
        await queryRunner.query(`CREATE TYPE "public"."course_purchases_status_enum" AS ENUM('pending', 'completed', 'refunded', 'failed')`);
        await queryRunner.query(`CREATE TABLE "course_purchases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "studentId" uuid NOT NULL, "courseId" uuid NOT NULL, "amount" numeric(10,2) NOT NULL DEFAULT '0', "platformCommission" numeric(10,2) NOT NULL DEFAULT '0', "teacherRevenue" numeric(10,2) NOT NULL DEFAULT '0', "currency" character varying NOT NULL DEFAULT 'egp', "kashierOrderId" character varying, "kashierPaymentId" character varying, "status" "public"."course_purchases_status_enum" NOT NULL DEFAULT 'pending', "purchasedAt" TIMESTAMP, CONSTRAINT "PK_7df47a16a5795b122e83b6e23cd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a36a3407771e501c3ee85fa232" ON "course_purchases" ("kashierOrderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c07f6e0d9c2310b1266d012e7e" ON "course_purchases" ("courseId", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_ed058f7f81120570c85f427587" ON "course_purchases" ("studentId", "status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_610689cb620fa612182f90daf5" ON "course_purchases" ("studentId", "courseId") `);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "hasUsedFreePlan"`);
        await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "visibility"`);
        await queryRunner.query(`DROP TYPE "public"."course_visibility_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "universityId" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD "faculty" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "department" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "year" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "storageQuotaBytes" bigint NOT NULL DEFAULT '5368709120'`);
        await queryRunner.query(`ALTER TABLE "course_content" ADD "isPreview" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "course" ADD "price" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "course" ADD "currency" character varying NOT NULL DEFAULT 'egp'`);
        await queryRunner.query(`ALTER TABLE "course" ADD "categoryId" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_c6c48d73b3b32e47e9cc1cfc4c" ON "course" ("categoryId") `);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_66d49e45ca25a0716c0db15572f" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "storage_subscriptions" ADD CONSTRAINT "FK_866f9c9c8c09537785c92af33cc" FOREIGN KEY ("instructorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "storage_subscriptions" ADD CONSTRAINT "FK_3f75b5999a141ee7303b096e349" FOREIGN KEY ("storagePlanId") REFERENCES "storage_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "storage_addons" ADD CONSTRAINT "FK_6b7fdd357bc7a0e991944085d9d" FOREIGN KEY ("instructorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "FK_c6c48d73b3b32e47e9cc1cfc4c4" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_purchases" ADD CONSTRAINT "FK_99cc2953bdc957f4c9552b5aa54" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_purchases" ADD CONSTRAINT "FK_625a9348a31c093f78314d79422" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_purchases" DROP CONSTRAINT "FK_625a9348a31c093f78314d79422"`);
        await queryRunner.query(`ALTER TABLE "course_purchases" DROP CONSTRAINT "FK_99cc2953bdc957f4c9552b5aa54"`);
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_c6c48d73b3b32e47e9cc1cfc4c4"`);
        await queryRunner.query(`ALTER TABLE "storage_addons" DROP CONSTRAINT "FK_6b7fdd357bc7a0e991944085d9d"`);
        await queryRunner.query(`ALTER TABLE "storage_subscriptions" DROP CONSTRAINT "FK_3f75b5999a141ee7303b096e349"`);
        await queryRunner.query(`ALTER TABLE "storage_subscriptions" DROP CONSTRAINT "FK_866f9c9c8c09537785c92af33cc"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_66d49e45ca25a0716c0db15572f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c6c48d73b3b32e47e9cc1cfc4c"`);
        await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "course_content" DROP COLUMN "isPreview"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "storageQuotaBytes"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "year"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "department"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "faculty"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "universityId"`);
        await queryRunner.query(`CREATE TYPE "public"."course_visibility_enum" AS ENUM('public', 'private')`);
        await queryRunner.query(`ALTER TABLE "course" ADD "visibility" "public"."course_visibility_enum" NOT NULL DEFAULT 'private'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "hasUsedFreePlan" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`DROP INDEX "public"."IDX_610689cb620fa612182f90daf5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ed058f7f81120570c85f427587"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c07f6e0d9c2310b1266d012e7e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a36a3407771e501c3ee85fa232"`);
        await queryRunner.query(`DROP TABLE "course_purchases"`);
        await queryRunner.query(`DROP TYPE "public"."course_purchases_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_420d9f679d41281f282f5bc7d0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b0be371d28245da6e4f4b6187"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_17d2e158329a542311afe8de07"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c4cca10935ec8576fb1b587e81"`);
        await queryRunner.query(`DROP TABLE "storage_addons"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e2879a4cdd5422e1b71efb8f5d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_74bbd07d22fb681932171cd1b4"`);
        await queryRunner.query(`DROP TABLE "storage_subscriptions"`);
        await queryRunner.query(`DROP TYPE "public"."storage_subscriptions_status_enum"`);
        await queryRunner.query(`DROP TABLE "storage_plans"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_25b08a78732a663bb35872eaa7"`);
        await queryRunner.query(`DROP TABLE "universities"`);
    }

}
