import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSemanticEmbeddingTable1777135000000
  implements MigrationInterface
{
  name = "CreateSemanticEmbeddingTable1777135000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "semantic_embedding" (
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ownerType" character varying NOT NULL,
        "ownerId" uuid NOT NULL,
        "chunkKey" character varying NOT NULL,
        "content" text NOT NULL,
        "embedding" vector(768) NOT NULL,
        "provider" character varying NOT NULL,
        "model" character varying NOT NULL,
        "dimension" integer NOT NULL,
        "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_semantic_embedding_uuid" PRIMARY KEY ("uuid"),
        CONSTRAINT "UQ_semantic_embedding_owner_chunk" UNIQUE ("ownerType", "ownerId", "chunkKey")
      )
    `);
    await queryRunner.query(`
      INSERT INTO "semantic_embedding" (
        "ownerType",
        "ownerId",
        "chunkKey",
        "content",
        "embedding",
        "provider",
        "model",
        "dimension",
        "metadata"
      )
      SELECT
        'book',
        "uuid",
        'default',
        trim(concat_ws(' ', "title", "description")),
        "embedding",
        'gemini',
        'gemini-embedding-001',
        768,
        jsonb_build_object('source', 'book')
      FROM "book"
      WHERE "embedding" IS NOT NULL
    `);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "embedding"`);
    await queryRunner.query(`
      CREATE INDEX "IDX_semantic_embedding_owner"
      ON "semantic_embedding" ("ownerType", "ownerId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_semantic_embedding_embedding_hnsw"
      ON "semantic_embedding"
      USING hnsw ("embedding" vector_cosine_ops)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_semantic_embedding_embedding_hnsw"`);
    await queryRunner.query(`DROP INDEX "IDX_semantic_embedding_owner"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "embedding" vector(768)`);
    await queryRunner.query(`
      UPDATE "book"
      SET "embedding" = "semantic_embedding"."embedding"
      FROM "semantic_embedding"
      WHERE "semantic_embedding"."ownerType" = 'book'
        AND "semantic_embedding"."ownerId" = "book"."uuid"
        AND "semantic_embedding"."chunkKey" = 'default'
    `);
    await queryRunner.query(`ALTER TABLE "book" ALTER COLUMN "embedding" SET NOT NULL`);
    await queryRunner.query(`DROP TABLE "semantic_embedding"`);
  }
}
