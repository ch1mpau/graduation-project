import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProjectTable1765907262863 implements MigrationInterface {
    name = 'UpdateProjectTable1765907262863'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" ADD "start_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "project" ADD "end_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "end_at"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "start_at"`);
    }

}
