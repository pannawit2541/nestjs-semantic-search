# nestjs-semantic-search

Minimal pnpm monorepo for a NestJS semantic-search POC.

## Stack

- pnpm workspace
- Turborepo task runner
- NestJS API
- TypeORM with PostgreSQL
- pgvector extension
- Vite React placeholder web app
- Docker Compose for PostgreSQL and Adminer

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm db:up
pnpm api:migration:run
pnpm dev
```

Services:

- API: http://localhost:3000
- Web app: http://localhost:5173
- Adminer: http://localhost:8080

Adminer connection:

- System: PostgreSQL
- Server: postgres
- Username: semantic_search
- Password: semantic_search
- Database: semantic_search

## Scripts

```bash
pnpm build
pnpm test
pnpm dev
pnpm db:up
pnpm db:down
pnpm api:migration:run
pnpm api:migration:revert
```

## Notes

This first setup intentionally keeps semantic-search behavior as foundation
only. The database is ready for pgvector migrations, but document storage,
embedding generation, and similarity-search endpoints are left for the next
iteration.
