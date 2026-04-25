import "reflect-metadata";
import { NotFoundException } from "@nestjs/common";
import { DeleteResult, Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Book } from "../src/book/book.entity";
import { BookService } from "../src/book/book.service";
import { EMBEDDING_PROVIDER } from "../src/embedding/embedding.interface";
import { EmbeddingProvider } from "../src/embedding/embedding.interface";
import { SemanticSearchService } from "../src/semantic-search/semantic-search.service";

type MockRepository = Pick<
  Repository<Book>,
  "create" | "save" | "find" | "findOneBy" | "preload" | "delete"
>;

const MOCK_EMBEDDING = new Array(768).fill(0);

describe("BookService", () => {
  let repository: MockRepository;
  let embeddingProvider: EmbeddingProvider;
  let semanticSearchService: SemanticSearchService;
  let service: BookService;

  beforeEach(() => {
    repository = {
      create: vi.fn((book: Partial<Book>) => book as Book),
      save: vi.fn(async (book: Book) => book),
      find: vi.fn(async () => []),
      findOneBy: vi.fn(),
      preload: vi.fn(),
      delete: vi.fn(),
    };
    embeddingProvider = { embed: vi.fn(async () => MOCK_EMBEDDING) };
    semanticSearchService = { search: vi.fn() } as unknown as SemanticSearchService;

    service = new BookService(
      repository as Repository<Book>,
      embeddingProvider,
      semanticSearchService,
    );
  });

  it("creates a book with embedding", async () => {
    const dto = { title: "Clean Code", description: "A Handbook of Agile Software Craftsmanship" };
    await service.create(dto);

    expect(embeddingProvider.embed).toHaveBeenCalledWith("Clean Code A Handbook of Agile Software Craftsmanship");
    expect(repository.create).toHaveBeenCalledWith({
      ...dto,
      embedding: MOCK_EMBEDDING,
    });
    expect(repository.save).toHaveBeenCalled();
  });

  it("creates a book with only title", async () => {
    const dto = { title: "Domain-Driven Design" };
    await service.create(dto);

    expect(embeddingProvider.embed).toHaveBeenCalledWith("Domain-Driven Design");
  });

  it("lists books by ascending title", async () => {
    await service.findAll();

    expect(repository.find).toHaveBeenCalledWith({
      order: { title: "ASC" },
    });
  });

  it("finds one book by uuid", async () => {
    const book = { uuid: "abc-123", title: "Clean Architecture" } as Book;
    vi.mocked(repository.findOneBy).mockResolvedValue(book);

    await expect(service.findOne("abc-123")).resolves.toBe(book);
  });

  it("throws when finding a missing book", async () => {
    vi.mocked(repository.findOneBy).mockResolvedValue(null);

    await expect(service.findOne("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("removes a book", async () => {
    vi.mocked(repository.delete).mockResolvedValue({ affected: 1 } as DeleteResult);

    await expect(service.remove("abc-123")).resolves.toBeUndefined();
  });

  it("throws when removing a missing book", async () => {
    vi.mocked(repository.delete).mockResolvedValue({ affected: 0 } as DeleteResult);

    await expect(service.remove("missing")).rejects.toBeInstanceOf(NotFoundException);
  });
});
