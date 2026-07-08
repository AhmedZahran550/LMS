import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStoragePlan1783545629713 implements MigrationInterface {
    name = 'AddStoragePlan1783545629713'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "storage_plan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "gigabytes" integer NOT NULL, "pricePerGb" numeric(10,2) NOT NULL DEFAULT '0', "totalPrice" numeric(10,2) NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_f205b9200dc6d4220e51305a48d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "storage_plan"`);
    }

}
