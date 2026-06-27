import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraintProviderProviderId1782557220154 implements MigrationInterface {
    name = 'AddUniqueConstraintProviderProviderId1782557220154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_6672b0eb4f01a89358c30008d69" UNIQUE ("provider", "providerId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_6672b0eb4f01a89358c30008d69"`);
    }

}
