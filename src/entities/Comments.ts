import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";

import { User } from "./Users.js";
import { Post } from "./Posts.js";

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type:"int"
  })
  user_id!: number;

  @Column({
    type:"int"
  })
  post_id!: number;

  @Column({
    type: "text",
    nullable: true,
  })
  comment!: string | null;

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "user_id",
  })
  user!: User;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "post_id",
  })
  post!: Post;

  @CreateDateColumn({
    type: "timestamp",
  })
  created_at!: Date;
}