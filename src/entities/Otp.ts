import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("otp_table")
export class Otp {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "varchar",
    length: 200,
    nullable: true,
  })
  email!: string | null;

  @Column({
    type: "varchar",
    length: 6,
    nullable: true,
  })
  otp!: string | null;

  @CreateDateColumn({
    type: "timestamp",
  })
  created_at!: Date;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  expires_at!: Date | null;
}