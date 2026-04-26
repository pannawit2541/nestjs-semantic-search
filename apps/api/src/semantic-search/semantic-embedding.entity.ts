import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class SemanticEmbedding {
  @PrimaryGeneratedColumn("uuid")
  declare uuid: string;

  @Column({ type: "varchar" })
  declare ownerType: string;

  @Column({ type: "uuid" })
  declare ownerId: string;

  @Column({ type: "varchar" })
  declare chunkKey: string;

  @Column({ type: "text" })
  declare content: string;

  @Column("vector", { length: 768 })
  declare embedding: number[];

  @Column({ type: "varchar" })
  declare provider: string;

  @Column({ type: "varchar" })
  declare model: string;

  @Column({ type: "int" })
  declare dimension: number;

  @Column({ type: "jsonb", default: () => "'{}'::jsonb" })
  declare metadata: Record<string, unknown>;

  @CreateDateColumn({ type: "timestamptz" })
  declare createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  declare updatedAt: Date;
}
