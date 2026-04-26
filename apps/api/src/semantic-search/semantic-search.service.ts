import { Inject, Injectable } from "@nestjs/common";
import {
  EMBEDDING_PROVIDER,
  EmbeddingProvider,
} from "../embedding/embedding.type";
import { SemanticIndexRepository } from "./repositories/semantic-index.repository";
import {
  SemanticDocument,
  SemanticSearchHit,
  SemanticSearchQuery,
} from "./semantic-search.types";
import { EntityManager } from "typeorm";

@Injectable()
export class SemanticSearchService {
  private readonly defaultLimit = 5;
  private readonly maxLimit = 50;

  constructor(
    @Inject(EMBEDDING_PROVIDER)
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly repository: SemanticIndexRepository,
  ) {}

  async index(
    document: SemanticDocument,
    manager?: EntityManager,
  ): Promise<void> {
    const content = this.normalizeText(document.content);
    const embedding = await this.embeddingProvider.embed(content);

    await this.repository.upsert(
      {
        ownerType: document.ownerType,
        ownerId: document.ownerId,
        chunkKey: document.chunkKey ?? "default",
        content,
        embedding,
        provider: this.embeddingProvider.provider,
        model: this.embeddingProvider.model,
        dimension: this.embeddingProvider.dimension,
        metadata: document.metadata ?? {},
      },
      manager,
    );
  }

  async removeOwner(
    ownerType: string,
    ownerId: string,
    manager?: EntityManager,
  ): Promise<void> {
    await this.repository.deleteOwner(ownerType, ownerId, manager);
  }

  async search(query: SemanticSearchQuery): Promise<SemanticSearchHit[]> {
    const normalizedQuery = this.normalizeText(query.query);
    const limit = this.normalizeLimit(query.limit);
    const embedding = await this.embeddingProvider.embed(normalizedQuery);

    return this.repository.search(query.ownerType, embedding, limit);
  }

  private normalizeText(text: string): string {
    const normalized = text.trim().replace(/\s+/g, " ");

    if (!normalized) {
      throw new Error("Semantic search text must not be empty");
    }

    return normalized;
  }

  private normalizeLimit(limit?: number): number {
    if (typeof limit !== "number" || !Number.isFinite(limit)) {
      return this.defaultLimit;
    }

    return Math.min(Math.max(Math.trunc(limit), 1), this.maxLimit);
  }
}
