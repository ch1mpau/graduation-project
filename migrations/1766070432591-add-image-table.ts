import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageTable1766070432591 implements MigrationInterface {
    name = 'AddImageTable1766070432591'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file" ("additional_data" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "path" character varying, "project_id" uuid, "task_id" uuid, "type" character varying, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_d0c32cdded78dfa676db2d1ffd1" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_8d6894434dbc389d6047dc1cc77" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_8d6894434dbc389d6047dc1cc77"`);
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_d0c32cdded78dfa676db2d1ffd1"`);
        await queryRunner.query(`DROP TABLE "file"`);
    }

}
