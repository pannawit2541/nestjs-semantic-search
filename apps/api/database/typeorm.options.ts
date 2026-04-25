import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export function databaseOptions(): PostgresConnectionOptions {
  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? 'semantic_search',
    username: process.env.POSTGRES_USER ?? 'semantic_search',
    password: process.env.POSTGRES_PASSWORD ?? 'semantic_search',
    synchronize: false,
    migrationsRun: false,
  };
}

export function typeOrmOptions(): TypeOrmModuleOptions {
  return {
    ...databaseOptions(),
    autoLoadEntities: true,
  };
}
