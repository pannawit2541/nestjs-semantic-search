import { Injectable, OnModuleInit } from "@nestjs/common";
import { EmbeddingProvider } from "../embedding.type";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class LocalEmbeddingProvider implements EmbeddingProvider, OnModuleInit {
  readonly provider = "local";
  readonly dimension = 768;

  declare private apiUrl: string;
  declare public model: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>("LOCAL_EMBEDDING_API_URL");
    const model = this.configService.get<string>("LOCAL_EMBEDDING_MODEL");

    if (!url || !model) {
      throw new Error(
        "LOCAL_EMBEDDING_API_URL or LOCAL_EMBEDDING_MODEL is not set",
      );
    }

    this.apiUrl = url.replace(/\/$/, "");
    this.model = model;
  }

  async embed(text: string): Promise<number[]> {
    const res = await fetch(`${this.apiUrl}/api/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        prompt: text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Ollama API error ${res.status}: ${body}`);
    }

    const json = await res.json();

    return json.embedding;
  }
}
