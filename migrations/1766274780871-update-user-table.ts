import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTable1766274780871 implements MigrationInterface {
    name = 'UpdateUserTable1766274780871'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "avatar_id" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_b777e56620c3f1ac0308514fc4c" UNIQUE ("avatar_id")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_b777e56620c3f1ac0308514fc4c" FOREIGN KEY ("avatar_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_b777e56620c3f1ac0308514fc4c"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_b777e56620c3f1ac0308514fc4c"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "avatar_id" character varying`);
    }

}
