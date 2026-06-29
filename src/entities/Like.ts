import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  CreateDateColumn,
} from "typeorm";

import { User } from "./Users.js";
import { Post } from "./Posts.js";

@Entity("likes")
export class Like {
  @PrimaryColumn({
    type:"int"
  })
  user_id!: number;

  @PrimaryColumn({
    type:"int"
  })
  post_id!: number;

  @ManyToOne(() => User, (user) => user.likes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "user_id",
  })
  user!: User;

  @ManyToOne(() => Post, (post) => post.likes, {
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