import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { BookService } from "./book.service";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";
import { SearchBookDto } from "./dto/search-book.dto";

@Controller("books")
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Get("search")
  search(@Query() searchBookDto: SearchBookDto) {
    const query = searchBookDto.query?.trim();

    if (!query) {
      throw new BadRequestException("query is required");
    }

    return this.bookService.search(query, this.parseLimit(searchBookDto.limit));
  }

  @Get()
  findAll() {
    return this.bookService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.bookService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(id, updateBookDto);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id") id: string) {
    return this.bookService.remove(id);
  }

  private parseLimit(limit?: number | string): number {
    const parsedLimit = typeof limit === "string" ? Number(limit) : limit;

    if (typeof parsedLimit !== "number" || !Number.isFinite(parsedLimit)) {
      return 5;
    }

    return Math.min(Math.max(Math.trunc(parsedLimit), 1), 50);
  }
}
