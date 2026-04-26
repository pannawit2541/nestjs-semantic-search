import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Book {
  @PrimaryGeneratedColumn("uuid")
  declare uuid: string;

  @Column({ type: "varchar" })
  declare title: string;

  @Column({ type: "varchar", nullable: true })
  declare description: string | null;

  @Column({ type: "int", nullable: true })
  declare publishedYear: number | null;
}
