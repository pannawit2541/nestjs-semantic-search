export const EMBEDDING_PROVIDER = "EMBEDDING_PROVIDER";

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}
