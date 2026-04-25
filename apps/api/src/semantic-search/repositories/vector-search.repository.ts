export const VECTOR_REPOSITORIES = "VECTOR_REPOSITORIES";

export interface VectorSearchRepository<T = unknown> {
  search(embedding: number[], limit: number): Promise<T[]>;
}
