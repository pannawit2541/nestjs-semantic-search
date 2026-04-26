import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookController } from "./book.controller";
import { Book } from "./book.entity";
import { BookService } from "./book.service";
import { EmbeddingModule } from "../embedding/embedding.module";
import { SemanticSearchModule } from "../semantic-search/semantic-search.module";
import { BookVectorRepository } from "../semantic-search/repositories/book-vector.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([Book]),
    EmbeddingModule,
    SemanticSearchModule.forFeature(BookVectorRepository, [Book]),
  ],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
