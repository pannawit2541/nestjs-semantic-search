import "reflect-metadata";
import { INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as supertest from "supertest";
import { join } from "path";
import { Book } from "../src/book/book.entity";
import { BookService } from "../src/book/book.service";
import { BookController } from "../src/book/book.controller";
import { EMBEDDING_PROVIDER } from "../src/embedding/embedding.interface";
import { SemanticSearchService } from "../src/semantic-search/semantic-search.service";
import { BookVectorRepository } from "../src/semantic-search/repositories/book-vector.repository";
import { SEMANTIC_SEARCH_REPO } from "../src/semantic-search/repositories/vector-search.repository";
import { typeOrmOptions } from "../database/typeorm.options";
import { Repository } from "typeorm";

const MOCK_EMBEDDING = new Array(768).fill(0);

describe("BookController (e2e)", () => {
  let app: INestApplication;
  let bookRepo: Repository<Book>;
  let createdUuids: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: [join(process.cwd(), "../../.env.local"), join(process.cwd(), "../../.env")],
        }),
        TypeOrmModule.forRootAsync({ useFactory: typeOrmOptions }),
        TypeOrmModule.forFeature([Book]),
      ],
      controllers: [BookController],
      providers: [
        BookService,
        SemanticSearchService,
        BookVectorRepository,
        { provide: EMBEDDING_PROVIDER, useValue: { embed: async () => MOCK_EMBEDDING } },
        {
          provide: SEMANTIC_SEARCH_REPO,
          useExisting: BookVectorRepository,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    bookRepo = moduleRef.get("BookRepository");
  });

  afterAll(async () => {
    if (createdUuids.length > 0) {
      await bookRepo.delete(createdUuids);
    }
    await app.close();
  });

  describe("POST /books", () => {
    it("creates a book with embedding", async () => {
      const res = await supertest
        .agent(app.getHttpServer())
        .post("/books")
        .send({ title: "Clean Code", description: "A Handbook of Agile Software Craftsmanship" })
        .expect(201);

      expect(res.body).toMatchObject({
        title: "Clean Code",
        description: "A Handbook of Agile Software Craftsmanship",
      });
      expect(res.body.uuid).toBeDefined();
      expect(res.body.embedding).toEqual(MOCK_EMBEDDING);

      createdUuids.push(res.body.uuid);
    });

    it("creates a book with only title", async () => {
      const res = await supertest
        .agent(app.getHttpServer())
        .post("/books")
        .send({ title: "Domain-Driven Design" })
        .expect(201);

      expect(res.body).toMatchObject({
        title: "Domain-Driven Design",
        description: null,
      });
      expect(res.body.uuid).toBeDefined();

      createdUuids.push(res.body.uuid);
    });
  });

  describe("GET /books/:uuid", () => {
    it("returns a book by uuid", async () => {
      const created = await supertest
        .agent(app.getHttpServer())
        .post("/books")
        .send({ title: "The Pragmatic Programmer" })
        .expect(201);

      createdUuids.push(created.body.uuid);

      const res = await supertest
        .agent(app.getHttpServer())
        .get(`/books/${created.body.uuid}`)
        .expect(200);

      expect(res.body).toMatchObject({
        uuid: created.body.uuid,
        title: "The Pragmatic Programmer",
      });
    });

    it("returns 404 for missing uuid", async () => {
      await supertest
        .agent(app.getHttpServer())
        .get("/books/00000000-0000-0000-0000-000000000000")
        .expect(404);
    });
  });

  describe("GET /books/search", () => {
    it("returns books matching the query", async () => {
      const res = await supertest
        .agent(app.getHttpServer())
        .get("/books/search?query=Clean&limit=5")
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].title).toBeDefined();
      expect(res.body[0].uuid).toBeDefined();
    });

    it("returns empty array when no matches", async () => {
      const res = await supertest
        .agent(app.getHttpServer())
        .get("/books/search?query=zzznonexistentzzz&limit=5")
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
