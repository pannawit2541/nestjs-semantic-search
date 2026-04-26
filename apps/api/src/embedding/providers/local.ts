import { EmbeddingProvider } from "../embedding.type";

export class LocalEmbeddingProvider implements EmbeddingProvider {
  readonly provider = "local";
  readonly model = "local-empty";
  readonly dimension = 0;

  async embed(text: string): Promise<number[]> {
    return [];
  }
}
