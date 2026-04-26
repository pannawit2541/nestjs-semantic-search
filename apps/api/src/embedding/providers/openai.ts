import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmbeddingProvider } from "../embedding.type";

@Injectable()
export class OpenAiEmbeddingProvider
  implements EmbeddingProvider, OnModuleInit
{
  readonly provider = "openai";
  readonly model = "text-embedding-3-small";
  readonly dimension = 1536;

  declare private apiKey?: string;
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.apiKey = this.configService.get<string>("OPENAI_API_KEY");
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
  }

  async embed(text: string): Promise<number[]> {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${body}`);
    }

    const json = (await res.json()) as {
      data: { embedding: number[] }[];
    };

    return json.data[0].embedding;
  }
}
