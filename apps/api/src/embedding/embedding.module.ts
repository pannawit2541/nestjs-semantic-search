import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { OpenAiEmbeddingProvider } from "./providers/openai";
import { EMBEDDING_PROVIDER } from "./embedding.interface";

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EMBEDDING_PROVIDER,
      useClass: OpenAiEmbeddingProvider,
    },
  ],
  exports: [EMBEDDING_PROVIDER],
})
export class EmbeddingModule {}
