import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBook1710000000001 implements MigrationInterface {
  name = 'CreateBook1710000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "book" (
        "id" SERIAL NOT NULL,
        "title" character varying NOT NULL,
        "description" character varying,
        "publishedYear" integer,
        CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "book"');
  }
}
