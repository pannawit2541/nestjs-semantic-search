import { config } from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { CreateBook1710000000001 } from './migrations/1710000000001-CreateBook';
import { InitPgvector1710000000000 } from './migrations/1710000000000-InitPgvector';
import { databaseOptions } from './typeorm.options';

config({ path: '../../.env' });
config();

export default new DataSource({
  ...databaseOptions(),
  migrations: [InitPgvector1710000000000, CreateBook1710000000001],
});
