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

@Entity("media")
export class Media {
  @PrimaryGeneratedColumn()
  media_id!: number;

  @Column({
    type:"int",
    nullable: true,
  })
  user_id!: number | null;

  @Column({
    type:"int",
    nullable: true,
  })
  post_id!: number | null;

  @Column({
    type: "varchar",
    length: 200,
    nullable: true,
  })
  filename!: string | null;

  @Column({
    type: "varchar",
    length: 200,
    nullable: true,
  })
  file_url!: string | null;

  @ManyToOne(() => User, (user) => user.media, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "user_id",
  })
  user!: User;

  @ManyToOne(() => Post, (post) => post.media, {
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