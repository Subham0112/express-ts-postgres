import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";

import { User } from "./Users.js";

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type:"int"
  })
  sender_id!: number;

  @Column({
    type:"int"
  })
  receiver_id!: number;

  @Column({
    type: "text",
    nullable: true,
  })
  messages!: string | null;

  @ManyToOne(() => User, (user) => user.sentMessages, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "sender_id",
  })
  sender!: User;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  @JoinColumn({
    name: "receiver_id",
  })
  receiver!: User;

  @CreateDateColumn({
    type: "timestamp",
  })
  created_at!: Date;
}