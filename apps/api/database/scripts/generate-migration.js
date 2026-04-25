const { spawnSync } = require("node:child_process");
const path = require("node:path");

const args = process.argv.slice(2);
const nameIndex = args.findIndex((arg) => !arg.startsWith("-"));

if (nameIndex === -1) {
  console.error("Usage: pnpm api:migration:generate <filename> [typeorm options]");
  process.exit(1);
}

const migrationName = args[nameIndex];
const migrationPath = migrationName.startsWith("database/migrations/")
  ? migrationName
  : path.posix.join("database/migrations", migrationName);

const typeormArgs = [
  "-r",
  "ts-node/register",
  "./node_modules/typeorm/cli.js",
  "-d",
  "database/data-source.ts",
  "migration:generate",
  migrationPath,
  ...args.slice(0, nameIndex),
  ...args.slice(nameIndex + 1),
];

const result = spawnSync(process.execPath, typeormArgs, {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
