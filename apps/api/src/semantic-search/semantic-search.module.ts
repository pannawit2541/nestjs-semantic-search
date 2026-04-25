import { DynamicModule, Module, Provider, Type } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SemanticSearchService } from "./semantic-search.service";
import { EmbeddingModule } from "../embedding/embedding.module";
import {
  VECTOR_REPOSITORIES,
  VectorSearchRepository,
} from "./repositories/vector-search.repository";

//TODO: refactor
@Module({})
export class SemanticSearchModule {
  static forFeature(
    repositoryTypes: Type<VectorSearchRepository>[],
    entities: Type[] = [],
  ): DynamicModule {
    const providers: Provider[] = [
      ...repositoryTypes,
      ...repositoryTypes.map((Repo) => ({
        provide: VECTOR_REPOSITORIES,
        useExisting: Repo,
        multi: true,
      })),
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
