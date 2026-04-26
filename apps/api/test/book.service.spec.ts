import "reflect-metadata";
import { NotFoundException } from "@nestjs/common";
import { DeleteResult, EntityManager, Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Book } from "../src/book/book.entity";
import { BookService } from "../src/book/book.service";
import { SemanticSearchService } from "../src/semantic-search/semantic-search.service";

type MockRepository = Pick<
  Repository<Book>,
  | "create"
  | "save"
  | "find"
  | "findBy"
  | "findOneBy"
  | "merge"
  | "delete"
  | "manager"
>;

describe("BookService", () => {
  let repository: MockRepository;
  let manager: EntityManager;
  let semanticSearchService: Pick<
    SemanticSearchService,
    "index" | "removeOwner" | "search"
  >;
  let service: BookService;

  beforeEach(() => {
    repository = {
      create: vi.fn((book: Partial<Book>) => book as Book),
      save: vi.fn(async (book: Book) => ({
        ...book,
        uuid: book.uuid ?? "abc-123",
        description: book.description ?? null,
        publishedYear: book.publishedYear ?? null,
      })),
      find: vi.fn(async () => []),
      findBy: vi.fn(async () => []),
      findOneBy: vi.fn(),
      merge: vi.fn((book: Book, update: Partial<Book>) =>
        Object.assign(book, update),
      ),
      delete: vi.fn(),
      manager: {
        transaction: vi.fn(async (callback) => callback(manager)),
      } as unknown as EntityManager,
    };
    manager = {
      getRepository: vi.fn(() => repository),
    } as unknown as EntityManager;
    semanticSearchService = {
      index: vi.fn(async () => undefined),
      removeOwner: vi.fn(async () => undefined),
      search: vi.fn(async () => []),
    };

    service = new BookService(
      repository as Repository<Book>,
      semanticSearchService as SemanticSearchService,
    );
  });

  it("creates a book and indexes searchable content", async () => {
    const dto = {
      title: "Clean Code",
      description: "A Handbook of Agile Software Craftsmanship",
    };

    const result = await service.create(dto);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalled();
    expect(semanticSearchService.index).toHaveBeenCalledWith(
      {
        ownerType: "book",
        ownerId: "abc-123",
        chunkKey: "default",
        content: "Clean Code A Handbook of Agile Software Craftsmanship",
        metadata: {
          title: "Clean Code",
          publishedYear: null,
        },
      },
      manager,
    );
    expect(result.uuid).toBe("abc-123");
  });

  it("creates a book with only title", async () => {
    await service.create({ title: "Domain-Driven Design" });

    expect(semanticSearchService.index).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "Domain-Driven Design",
      }),
      manager,
    );
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

    await expect(service.findOne("missing")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("updates and reindexes when searchable fields change", async () => {
    vi.mocked(repository.findOneBy).mockResolvedValue({
      uuid: "abc-123",
      title: "Clean Code",
      description: null,
      publishedYear: null,
    } as Book);

    await service.update("abc-123", { description: "Updated" });

    expect(repository.merge).toHaveBeenCalled();
    expect(semanticSearchService.index).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "Clean Code Updated",
      }),
      manager,
    );
  });

  it("updates without reindexing when searchable fields do not change", async () => {
    vi.mocked(repository.findOneBy).mockResolvedValue({
      uuid: "abc-123",
      title: "Clean Code",
      description: null,
      publishedYear: null,
    } as Book);

    await service.update("abc-123", { publishedYear: 2008 });

    expect(semanticSearchService.index).not.toHaveBeenCalled();
  });

  it("throws when updating a missing book", async () => {
    vi.mocked(repository.findOneBy).mockResolvedValue(null);

    await expect(service.update("missing", { title: "Nope" })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("removes a book and semantic rows", async () => {
    vi.mocked(repository.delete).mockResolvedValue({ affected: 1 } as DeleteResult);

    await expect(service.remove("abc-123")).resolves.toBeUndefined();

    expect(semanticSearchService.removeOwner).toHaveBeenCalledWith(
      "book",
      "abc-123",
      manager,
    );
  });

  it("throws when removing a missing book", async () => {
    vi.mocked(repository.delete).mockResolvedValue({ affected: 0 } as DeleteResult);

    await expect(service.remove("missing")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(semanticSearchService.removeOwner).not.toHaveBeenCalled();
  });

  it("searches via semantic search service and preserves ranking", async () => {
    const first = { uuid: "a", title: "Clean Code" } as Book;
    const second = { uuid: "b", title: "Clean Architecture" } as Book;
    vi.mocked(semanticSearchService.search).mockResolvedValue([
      {
        ownerType: "book",
        ownerId: "b",
        chunkKey: "default",
        score: 0.9,
        content: "",
        metadata: {},
      },
      {
        ownerType: "book",
        ownerId: "a",
        chunkKey: "default",
        score: 0.7,
        content: "",
        metadata: {},
      },
    ]);
    vi.mocked(repository.findBy).mockResolvedValue([first, second]);

    const result = await service.search("clean");

    expect(semanticSearchService.search).toHaveBeenCalledWith({
      ownerType: "book",
      query: "clean",
      limit: 5,
    });
    expect(result).toEqual([
      { item: second, score: 0.9 },
      { item: first, score: 0.7 },
    ]);
  });
});
