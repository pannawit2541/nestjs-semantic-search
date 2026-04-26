export const EMBEDDING_PROVIDER = "EMBEDDING_PROVIDER";

export interface EmbeddingProvider {
  readonly provider: string;
  readonly model: string;
  readonly dimension: number;

  embed(text: string): Promise<number[]>;
}
