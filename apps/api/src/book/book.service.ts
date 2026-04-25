import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Book } from "./book.entity";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";
import { EMBEDDING_PROVIDER, EmbeddingProvider } from "../embedding/embedding.interface";
import { SemanticSearchService } from "../semantic-search/semantic-search.service";

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @Inject(EMBEDDING_PROVIDER)
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly semanticSearchService: SemanticSearchService,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const textToEmbed = [createBookDto.title, createBookDto.description]
      .filter(Boolean)
      .join(" ");

    const embedding = await this.embeddingProvider.embed(textToEmbed);

    const book = this.bookRepository.create({
      ...createBookDto,
      embedding,
    });

    return this.bookRepository.save(book);
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepository.find({
      order: { title: "ASC" },
    });
  }

  async findOne(uuid: string): Promise<Book> {
    const book = await this.bookRepository.findOneBy({ uuid });

    if (!book) {
      throw new NotFoundException(`Book ${uuid} was not found`);
    }

    return book;
  }

  async update(uuid: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.bookRepository.preload({
      uuid,
      ...updateBookDto,
    });

    if (!book) {
      throw new NotFoundException(`Book ${uuid} was not found`);
    }

    return this.bookRepository.save(book);
  }

  async remove(uuid: string): Promise<void> {
    const result = await this.bookRepository.delete({ uuid });

    if (!result.affected) {
      throw new NotFoundException(`Book ${uuid} was not found`);
    }
  }

  async search(query: string, limit: number = 5) {
    return this.semanticSearchService.search(query, limit);
  }
}
