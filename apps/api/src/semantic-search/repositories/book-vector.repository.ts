import { Book } from "src/book/book.entity";
import { VectorSearchRepository } from "./vector-search.repository";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

export class BookVectorRepository implements VectorSearchRepository<Book> {
  constructor(
    @InjectRepository(Book)
    private readonly repo: Repository<Book>,
  ) {}

  async search(embedding: number[], limit: number): Promise<Book[]> {
    return this.repo
      .createQueryBuilder("book")
      .orderBy("book.embedding <=> :embedding", "ASC")
      .setParameter("embedding", `[${embedding.join(",")}]`)
      .limit(limit)
      .getMany();
  }
}
