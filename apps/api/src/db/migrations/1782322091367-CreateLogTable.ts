import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLogTable1782322091367 implements MigrationInterface {
    name = 'CreateLogTable1782322091367'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "method" character varying NOT NULL, "url" character varying NOT NULL, "ip" character varying, "userId" character varying, "statusCode" integer NOT NULL, "responseTime" integer NOT NULL, "requestBody" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_350604cbdf991d5930d9e618fbd" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "log"`);
    }

}
