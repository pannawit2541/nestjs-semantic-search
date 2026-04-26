export interface SemanticDocument {
  ownerType: string;
  ownerId: string;
  chunkKey?: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface SemanticSearchQuery {
  ownerType: string;
  query: string;
  limit?: number;
}

export interface SemanticSearchHit {
  ownerType: string;
  ownerId: string;
  chunkKey: string;
  score: number;
  content: string;
  metadata: Record<string, unknown>;
}

export interface SemanticSearchResult<T> {
  item: T;
  score: number;
}
