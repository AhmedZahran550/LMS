import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileImageUrl1782320167226 implements MigrationInterface {
    name = 'AddProfileImageUrl1782320167226'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "profileImageUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profileImageUrl"`);
    }

}
