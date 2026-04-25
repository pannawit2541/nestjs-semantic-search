import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialBookTable1777124762999 implements MigrationInterface {
    name = 'InitialBookTable1777124762999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "book" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "publishedYear" integer, "embedding" vector(1536) NOT NULL, CONSTRAINT "PK_0a5875eb5ec460206c670c3b62d" PRIMARY KEY ("uuid"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "book"`);
    }

}
