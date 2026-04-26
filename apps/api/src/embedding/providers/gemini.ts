import { ConfigService } from "@nestjs/config";
import { EmbeddingProvider } from "../embedding.type";
import { Injectable, OnModuleInit } from "@nestjs/common";

@Injectable()
export class GeminiEmbeddingProvider
  implements EmbeddingProvider, OnModuleInit
{
  readonly provider = "gemini";
  readonly model = "gemini-embedding-001";
  readonly dimension = 768;

  declare private apiKey?: string;
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.apiKey = this.configService.get<string>("GEMINI_API_KEY");
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
  }

  async embed(text: string): Promise<number[]> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:embedContent?key=` +
        this.apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: {
            parts: [{ text }],
          },
          outputDimensionality: this.dimension,
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${body}`);
    }

    const json = await res.json();

    return json.embedding.values;
  }
}
