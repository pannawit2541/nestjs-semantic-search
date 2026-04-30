import { LocalEmbeddingProvider } from "./providers/local";
import { EMBEDDING_PROVIDER } from "./embedding.type";
import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EMBEDDING_PROVIDER,
      useClass: LocalEmbeddingProvider,
    },
  ],
  exports: [EMBEDDING_PROVIDER],
})
export class EmbeddingModule {}
