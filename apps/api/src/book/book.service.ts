import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Book } from "./book.entity";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";
import { SemanticSearchService } from "../semantic-search/semantic-search.service";
import { SemanticSearchResult } from "../semantic-search/semantic-search.types";

@Injectable()
export class BookService {
  private readonly semanticOwnerType = "book";

  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly semanticSearchService: SemanticSearchService,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    return this.bookRepository.manager.transaction(async (manager) => {
      const bookRepository = manager.getRepository(Book);
      const book = await bookRepository.save(
        bookRepository.create(createBookDto),
      );

      await this.semanticSearchService.index(
        this.toSemanticDocument(book),
        manager,
      );

      return book;
    });
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
    return this.bookRepository.manager.transaction(async (manager) => {
      const bookRepository = manager.getRepository(Book);
      const book = await bookRepository.findOneBy({ uuid });

      if (!book) {
        throw new NotFoundException(`Book ${uuid} was not found`);
      }

      const shouldRefreshSearch = this.hasSearchableChanges(updateBookDto);
      bookRepository.merge(book, updateBookDto);
      const savedBook = await bookRepository.save(book);

      if (shouldRefreshSearch) {
        await this.semanticSearchService.index(
          this.toSemanticDocument(savedBook),
          manager,
        );
      }

      return savedBook;
    });
  }

  async remove(uuid: string): Promise<void> {
    await this.bookRepository.manager.transaction(async (manager) => {
      const bookRepository = manager.getRepository(Book);
      const result = await bookRepository.delete({ uuid });

      if (!result.affected) {
        throw new NotFoundException(`Book ${uuid} was not found`);
      }

      await this.semanticSearchService.removeOwner(
        this.semanticOwnerType,
        uuid,
        manager,
      );
    });
  }

  async search(
    query: string,
    limit: number = 5,
  ): Promise<SemanticSearchResult<Book>[]> {
    const hits = await this.semanticSearchService.search({
      ownerType: this.semanticOwnerType,
      query,
      limit,
    });

    if (hits.length === 0) {
      return [];
    }

    const books = await this.bookRepository.findBy({
      uuid: In(hits.map((hit) => hit.ownerId)),
    });
    const bookByUuid = new Map(books.map((book) => [book.uuid, book]));

    return hits.flatMap((hit) => {
      const book = bookByUuid.get(hit.ownerId);
      return book ? [{ item: book, score: hit.score }] : [];
    });
  }

  private toSemanticDocument(book: Book) {
    return {
      ownerType: this.semanticOwnerType,
      ownerId: book.uuid,
      chunkKey: "default",
      content: [book.title, book.description].filter(Boolean).join(" "),
      metadata: {
        title: book.title,
        publishedYear: book.publishedYear,
      },
    };
  }

  private hasSearchableChanges(updateBookDto: UpdateBookDto): boolean {
    return "title" in updateBookDto || "description" in updateBookDto;
  }
}
