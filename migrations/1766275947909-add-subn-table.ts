import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubnTable1766275947909 implements MigrationInterface {
    name = 'AddSubnTable1766275947909'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "project_customer" ("additional_data" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "project_id" uuid NOT NULL, CONSTRAINT "PK_9822110bfde667efe4165da219e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task_user" ("additional_data" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "task_id" uuid NOT NULL, CONSTRAINT "PK_6ea2c1c13f01b7a383ebbeaebb0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "project_customer" ADD CONSTRAINT "FK_09250b9a648e1b245c559b801e0" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_customer" ADD CONSTRAINT "FK_06b853749c39ae5e46ab22bdbb5" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_user" ADD CONSTRAINT "FK_e03fae50af89456e18265364771" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_user" ADD CONSTRAINT "FK_92c6c68c7c7254a79d875691b6a" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_user" DROP CONSTRAINT "FK_92c6c68c7c7254a79d875691b6a"`);
        await queryRunner.query(`ALTER TABLE "task_user" DROP CONSTRAINT "FK_e03fae50af89456e18265364771"`);
        await queryRunner.query(`ALTER TABLE "project_customer" DROP CONSTRAINT "FK_06b853749c39ae5e46ab22bdbb5"`);
        await queryRunner.query(`ALTER TABLE "project_customer" DROP CONSTRAINT "FK_09250b9a648e1b245c559b801e0"`);
        await queryRunner.query(`DROP TABLE "task_user"`);
        await queryRunner.query(`DROP TABLE "project_customer"`);
    }

}
