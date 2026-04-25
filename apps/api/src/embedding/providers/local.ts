import { EmbeddingProvider } from "../embedding.interface";

export class LocalEmbeddingProvider implements EmbeddingProvider {
  async embed(text: string): Promise<number[]> {
    return [];
  }
}
