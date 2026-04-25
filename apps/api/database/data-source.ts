import { config } from "dotenv";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { databaseOptions } from "./typeorm.options";

config({ path: "../../.env" });
config();

export default new DataSource({
  ...databaseOptions(),
  entities: [`${__dirname}/../src/**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
});
