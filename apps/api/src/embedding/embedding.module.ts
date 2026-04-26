import { GeminiEmbeddingProvider } from "./providers/gemini";
import { EMBEDDING_PROVIDER } from "./embedding.type";
import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EMBEDDING_PROVIDER,
      useClass: GeminiEmbeddingProvider,
    },
  ],
  exports: [EMBEDDING_PROVIDER],
})
export class EmbeddingModule {}
