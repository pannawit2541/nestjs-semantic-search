import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterBookEmbeddingVector7681777132308107 implements MigrationInterface {
    name = 'AlterBookEmbeddingVector7681777132308107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "embedding"`);
        await queryRunner.query(`ALTER TABLE "book" ADD "embedding" vector(768) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "embedding"`);
        await queryRunner.query(`ALTER TABLE "book" ADD "embedding" vector(1536) NOT NULL`);
    }

}
