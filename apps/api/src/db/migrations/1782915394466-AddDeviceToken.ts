import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeviceToken1782915394466 implements MigrationInterface {
    name = 'AddDeviceToken1782915394466'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "device_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "deviceToken" character varying NOT NULL, "deviceInfo" jsonb, "userId" uuid, CONSTRAINT "PK_592ce89b9ea1a268d6140f60422" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "DEVICE_TOKEN_USER_IDX" ON "device_token" ("userId", "deviceToken") `);
        await queryRunner.query(`ALTER TABLE "device_token" ADD CONSTRAINT "FK_ba0cbbc3097f061e197e71c112e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "device_token" DROP CONSTRAINT "FK_ba0cbbc3097f061e197e71c112e"`);
        await queryRunner.query(`DROP INDEX "public"."DEVICE_TOKEN_USER_IDX"`);
        await queryRunner.query(`DROP TABLE "device_token"`);
    }

}
