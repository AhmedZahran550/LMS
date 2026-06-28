import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubscriptionSystem1782607831764 implements MigrationInterface {
    name = 'AddSubscriptionSystem1782607831764'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_32d94af473bb59d808d9a68e17b"`);
        await queryRunner.query(`CREATE TYPE "public"."subscription_plan_name_enum" AS ENUM('free', 'pro', 'plus')`);
        await queryRunner.query(`CREATE TABLE "subscription_plan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" "public"."subscription_plan_name_enum" NOT NULL DEFAULT 'free', "description" text NOT NULL DEFAULT '', "price" integer NOT NULL DEFAULT '0', "currency" character varying NOT NULL DEFAULT 'usd', "maxCourses" integer NOT NULL DEFAULT '0', "maxStudentsPerCourse" integer NOT NULL DEFAULT '0', "maxStorageBytes" bigint NOT NULL DEFAULT '0', "trialDays" integer NOT NULL DEFAULT '0', "stripePriceId" character varying, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_5fde988e5d9b9a522d70ebec27c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."instructor_subscription_status_enum" AS ENUM('trialing', 'active', 'past_due', 'cancelled', 'expired')`);
        await queryRunner.query(`CREATE TABLE "instructor_subscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "instructorId" uuid NOT NULL, "planId" uuid NOT NULL, "status" "public"."instructor_subscription_status_enum" NOT NULL DEFAULT 'trialing', "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP, "trialEndDate" TIMESTAMP, "stripeCustomerId" character varying, "stripeSubscriptionId" character varying, "autoRenew" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_b1398ce9dd9dce2f54628fa66cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum" AS ENUM('pending', 'succeeded', 'failed', 'refunded')`);
        await queryRunner.query(`CREATE TABLE "payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "instructorSubscriptionId" uuid NOT NULL, "amount" integer NOT NULL DEFAULT '0', "currency" character varying NOT NULL DEFAULT 'usd', "status" "public"."payment_status_enum" NOT NULL DEFAULT 'pending', "stripePaymentIntentId" character varying NOT NULL, "stripeInvoiceId" character varying, "description" text, CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "instructorId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "instructor_subscription" ADD CONSTRAINT "FK_835e84701b24df3af451844052c" FOREIGN KEY ("instructorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "instructor_subscription" ADD CONSTRAINT "FK_ea89ecff71c3a5497923fa359a0" FOREIGN KEY ("planId") REFERENCES "subscription_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_1af6b0dc5538fcbc0f3c9161832" FOREIGN KEY ("instructorSubscriptionId") REFERENCES "instructor_subscription"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "FK_32d94af473bb59d808d9a68e17b" FOREIGN KEY ("instructorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_32d94af473bb59d808d9a68e17b"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_1af6b0dc5538fcbc0f3c9161832"`);
        await queryRunner.query(`ALTER TABLE "instructor_subscription" DROP CONSTRAINT "FK_ea89ecff71c3a5497923fa359a0"`);
        await queryRunner.query(`ALTER TABLE "instructor_subscription" DROP CONSTRAINT "FK_835e84701b24df3af451844052c"`);
        await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "instructorId" SET NOT NULL`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
        await queryRunner.query(`DROP TABLE "instructor_subscription"`);
        await queryRunner.query(`DROP TYPE "public"."instructor_subscription_status_enum"`);
        await queryRunner.query(`DROP TABLE "subscription_plan"`);
        await queryRunner.query(`DROP TYPE "public"."subscription_plan_name_enum"`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "FK_32d94af473bb59d808d9a68e17b" FOREIGN KEY ("instructorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
