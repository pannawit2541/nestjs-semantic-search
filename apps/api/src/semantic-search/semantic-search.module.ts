import { DynamicModule, Module, Provider, Type } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SemanticSearchService } from "./semantic-search.service";
import { EmbeddingModule } from "../embedding/embedding.module";
import {
  SEMANTIC_SEARCH_REPO,
  VectorSearchRepository,
} from "./repositories/vector-search.repository";

@Module({})
export class SemanticSearchModule {
  static forFeature(
    repositoryType: Type<VectorSearchRepository>,
    entities: Type[] = [],
  ): DynamicModule {
    const providers: Provider[] = [
      repositoryType,
      {
        provide: SEMANTIC_SEARCH_REPO,
        useExisting: repositoryType,
      },
      SemanticSearchService,
    ];

    return {
      module: SemanticSearchModule,
      imports: [EmbeddingModule, TypeOrmModule.forFeature(entities)],
      providers,
      exports: [SemanticSearchService],
    };
  }
}
