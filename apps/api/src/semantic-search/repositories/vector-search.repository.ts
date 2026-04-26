export const SEMANTIC_SEARCH_REPO = "SEMANTIC_SEARCH_REPO";

export interface VectorSearchRepository<T = unknown> {
  search(embedding: number[], limit: number): Promise<T[]>;
}
