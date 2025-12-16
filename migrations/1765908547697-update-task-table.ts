import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTaskTable1765908547697 implements MigrationInterface {
    name = 'UpdateTaskTable1765908547697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" ADD "completed_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "completed_at"`);
    }

}
