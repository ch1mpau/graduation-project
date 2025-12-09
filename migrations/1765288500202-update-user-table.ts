import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTable1765288500202 implements MigrationInterface {
    name = 'UpdateUserTable1765288500202'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "name" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
    }

}
