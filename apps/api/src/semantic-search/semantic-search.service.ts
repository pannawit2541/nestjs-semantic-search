import { Inject, Injectable } from "@nestjs/common";
import { EMBEDDING_PROVIDER } from "../embedding/embedding.interface";
import { EmbeddingProvider } from "../embedding/embedding.interface";
import {
  VECTOR_REPOSITORIES,
  VectorSearchRepository,
} from "./repositories/vector-search.repository";

@Injectable()
export class SemanticSearchService<T = unknown> {
  constructor(
    @Inject(EMBEDDING_PROVIDER)
    private readonly embeddingProvider: EmbeddingProvider,
    @Inject(VECTOR_REPOSITORIES)
    private readonly repositories: VectorSearchRepository<T>[],
  ) {}

  async search(query: string, limit: number = 5) {
    const embedding = await this.embeddingProvider.embed(query);
    const results = await Promise.all(
      this.repositories.map((repo) => repo.search(embedding, limit)),
    );
    return results;
  }
}
