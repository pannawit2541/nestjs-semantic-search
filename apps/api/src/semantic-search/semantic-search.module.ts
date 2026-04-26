import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SemanticSearchService } from "./semantic-search.service";
import { EmbeddingModule } from "../embedding/embedding.module";
import { SemanticEmbedding } from "./semantic-embedding.entity";
import { SemanticIndexRepository } from "./repositories/semantic-index.repository";

@Module({
  imports: [EmbeddingModule, TypeOrmModule.forFeature([SemanticEmbedding])],
  providers: [SemanticIndexRepository, SemanticSearchService],
  exports: [SemanticSearchService],
})
export class SemanticSearchModule {}
