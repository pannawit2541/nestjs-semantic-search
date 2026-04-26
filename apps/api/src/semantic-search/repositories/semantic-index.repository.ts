import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { SemanticEmbedding } from "../semantic-embedding.entity";
import { SemanticDocument, SemanticSearchHit } from "../semantic-search.types";

export interface SemanticEmbeddingRecord extends SemanticDocument {
  chunkKey: string;
  embedding: number[];
  provider: string;
  model: string;
  dimension: number;
}

@Injectable()
export class SemanticIndexRepository {
  constructor(
    @InjectRepository(SemanticEmbedding)
    private readonly repository: Repository<SemanticEmbedding>,
  ) {}

  async upsert(
    record: SemanticEmbeddingRecord,
    manager?: EntityManager,
  ): Promise<void> {
    const repository = this.getRepository(manager);
    const values: QueryDeepPartialEntity<SemanticEmbedding> = {
      ownerType: record.ownerType,
      ownerId: record.ownerId,
      chunkKey: record.chunkKey,
      content: record.content,
      embedding: record.embedding,
      provider: record.provider,
      model: record.model,
      dimension: record.dimension,
      metadata: record.metadata as QueryDeepPartialEntity<
        Record<string, unknown>
      >,
    };

    await repository.upsert(values, ["ownerType", "ownerId", "chunkKey"]);
  }

  async deleteOwner(
    ownerType: string,
    ownerId: string,
    manager?: EntityManager,
  ): Promise<void> {
    await this.getRepository(manager).delete({ ownerType, ownerId });
  }

  async search(
    ownerType: string,
    embedding: number[],
    limit: number,
  ): Promise<SemanticSearchHit[]> {
    const rows = await this.repository
      .createQueryBuilder("embedding")
      .select([
        'embedding."ownerType" AS "ownerType"',
        'embedding."ownerId" AS "ownerId"',
        'embedding."chunkKey" AS "chunkKey"',
        'embedding."content" AS "content"',
        'embedding."metadata" AS "metadata"',
        '1 - (embedding."embedding" <=> :embedding) AS "score"',
      ])
      .where('embedding."ownerType" = :ownerType', { ownerType })
      .orderBy('embedding."embedding" <=> :embedding', "ASC")
      .setParameter("embedding", `[${embedding.join(",")}]`)
      .limit(limit)
      .getRawMany<{
        ownerType: string;
        ownerId: string;
        chunkKey: string;
        content: string;
        metadata: Record<string, unknown>;
        score: string | number;
      }>();

    return rows.map((row) => ({
      ownerType: row.ownerType,
      ownerId: row.ownerId,
      chunkKey: row.chunkKey,
      content: row.content,
      metadata: row.metadata,
      score: Number(row.score),
    }));
  }

  private getRepository(manager?: EntityManager): Repository<SemanticEmbedding> {
    return manager
      ? manager.getRepository(SemanticEmbedding)
      : this.repository;
  }
}
