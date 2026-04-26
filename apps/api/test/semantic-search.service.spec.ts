import "reflect-metadata";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmbeddingProvider } from "../src/embedding/embedding.type";
import { SemanticIndexRepository } from "../src/semantic-search/repositories/semantic-index.repository";
import { SemanticSearchService } from "../src/semantic-search/semantic-search.service";

const MOCK_EMBEDDING = [1, ...new Array(767).fill(0)];

describe("SemanticSearchService", () => {
  let embeddingProvider: EmbeddingProvider;
  let repository: Pick<
    SemanticIndexRepository,
    "upsert" | "deleteOwner" | "search"
  >;
  let service: SemanticSearchService;

  beforeEach(() => {
    embeddingProvider = {
      provider: "test",
      model: "test-model",
      dimension: 768,
      embed: vi.fn(async () => MOCK_EMBEDDING),
    };
    repository = {
      upsert: vi.fn(async () => undefined),
      deleteOwner: vi.fn(async () => undefined),
      search: vi.fn(async () => []),
    };
    service = new SemanticSearchService(
      embeddingProvider,
      repository as SemanticIndexRepository,
    );
  });

  it("indexes normalized content with provider metadata", async () => {
    await service.index({
      ownerType: "book",
      ownerId: "abc-123",
      content: "  Clean   Code  ",
      metadata: { title: "Clean Code" },
    });

    expect(embeddingProvider.embed).toHaveBeenCalledWith("Clean Code");
    expect(repository.upsert).toHaveBeenCalledWith(
      {
        ownerType: "book",
        ownerId: "abc-123",
        chunkKey: "default",
        content: "Clean Code",
        embedding: MOCK_EMBEDDING,
        provider: "test",
        model: "test-model",
        dimension: 768,
        metadata: { title: "Clean Code" },
      },
      undefined,
    );
  });

  it("searches by owner type with a clamped limit", async () => {
    await service.search({
      ownerType: "book",
      query: " clean ",
      limit: 100,
    });

    expect(embeddingProvider.embed).toHaveBeenCalledWith("clean");
    expect(repository.search).toHaveBeenCalledWith("book", MOCK_EMBEDDING, 50);
  });

  it("removes all semantic rows for an owner", async () => {
    await service.removeOwner("book", "abc-123");

    expect(repository.deleteOwner).toHaveBeenCalledWith(
      "book",
      "abc-123",
      undefined,
    );
  });
});
