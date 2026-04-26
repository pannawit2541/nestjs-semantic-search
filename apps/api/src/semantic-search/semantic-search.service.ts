import { Inject, Injectable } from "@nestjs/common";
import { EMBEDDING_PROVIDER, EmbeddingProvider } from "../embedding/embedding.interface";
import { SEMANTIC_SEARCH_REPO, VectorSearchRepository } from "./repositories/vector-search.repository";

@Injectable()
export class SemanticSearchService<T> {
  constructor(
    @Inject(EMBEDDING_PROVIDER)
    private readonly embeddingProvider: EmbeddingProvider,
    @Inject(SEMANTIC_SEARCH_REPO)
    private readonly repository: VectorSearchRepository<T>,
  ) {}

  async search(query: string, limit: number = 5): Promise<T[]> {
    const embedding = await this.embeddingProvider.embed(query);
    return this.repository.search(embedding, limit);
  }
}
