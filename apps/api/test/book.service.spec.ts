import 'reflect-metadata';
import { NotFoundException } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Book } from '../src/book/book.entity';
import { BookService } from '../src/book/book.service';

type MockRepository = Pick<
  Repository<Book>,
  'create' | 'save' | 'find' | 'findOneBy' | 'preload' | 'delete'
>;

describe('BookService', () => {
  let repository: MockRepository;
  let service: BookService;

  beforeEach(() => {
    repository = {
      create: vi.fn((book: Partial<Book>) => book as Book),
      save: vi.fn(async (book: Book) => ({ id: book.id ?? 1, ...book })),
      find: vi.fn(async () => []),
      findOneBy: vi.fn(),
      preload: vi.fn(),
      delete: vi.fn(),
    };
    service = new BookService(repository as Repository<Book>);
  });

  it('creates a book', async () => {
    await expect(service.create({ title: 'Domain-Driven Design' })).resolves.toEqual({
      id: 1,
      title: 'Domain-Driven Design',
    });

    expect(repository.create).toHaveBeenCalledWith({
      title: 'Domain-Driven Design',
    });
    expect(repository.save).toHaveBeenCalledWith({
      title: 'Domain-Driven Design',
    });
  });

  it('lists books by ascending id', async () => {
    await service.findAll();

    expect(repository.find).toHaveBeenCalledWith({
      order: {
        id: 'ASC',
      },
    });
  });

  it('finds one book by id', async () => {
    const book = { id: 1, title: 'Clean Architecture' } as Book;
    vi.mocked(repository.findOneBy).mockResolvedValue(book);

    await expect(service.findOne(1)).resolves.toBe(book);
  });

  it('throws when finding a missing book', async () => {
    vi.mocked(repository.findOneBy).mockResolvedValue(null);

    await expect(service.findOne(404)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates a book', async () => {
    const book = { id: 1, title: 'Updated' } as Book;
    vi.mocked(repository.preload).mockResolvedValue(book);

    await expect(service.update(1, { title: 'Updated' })).resolves.toEqual(book);
    expect(repository.preload).toHaveBeenCalledWith({
      id: 1,
      title: 'Updated',
    });
    expect(repository.save).toHaveBeenCalledWith(book);
  });

  it('throws when updating a missing book', async () => {
    vi.mocked(repository.preload).mockResolvedValue(undefined);

    await expect(service.update(404, { title: 'Missing' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('removes a book', async () => {
    vi.mocked(repository.delete).mockResolvedValue({ affected: 1 } as DeleteResult);

    await expect(service.remove(1)).resolves.toBeUndefined();
  });

  it('throws when removing a missing book', async () => {
    vi.mocked(repository.delete).mockResolvedValue({ affected: 0 } as DeleteResult);

    await expect(service.remove(404)).rejects.toBeInstanceOf(NotFoundException);
  });
});
