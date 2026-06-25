import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationRelatedEntityColumns1782422000357 implements MigrationInterface {
    name = 'AddNotificationRelatedEntityColumns1782422000357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ADD "relatedEntityType" character varying`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "relatedEntityId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "relatedEntityId"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "relatedEntityType"`);
    }

}
