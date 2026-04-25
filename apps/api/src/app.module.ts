import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { typeOrmOptions } from '../database/typeorm.options';
import { BookModule } from './book/book.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(process.cwd(), '../../.env.local'), join(process.cwd(), '../../.env')],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmOptions,
    }),
    BookModule,
  ],
})
export class AppModule {}
