import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmOptions } from '../database/typeorm.options';
import { BookModule } from './book/book.module';
import { SemanticSearchModule } from './semantic-search/semantic-search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmOptions,
    }),
    BookModule,
    SemanticSearchModule,
  ],
})
export class AppModule {}
