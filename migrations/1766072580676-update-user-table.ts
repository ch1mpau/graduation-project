import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTable1766072580676 implements MigrationInterface {
    name = 'UpdateUserTable1766072580676'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "avatar_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar_id"`);
    }

}
