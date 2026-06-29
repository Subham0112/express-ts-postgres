import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";

import { Post } from "./Posts.js";
import { Media } from "./Media.js";
import { Like } from "./Like.js";
import { Comment } from "./Comments.js";
import { Message } from "./Message.js";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "varchar",
    length: 200,
    nullable: true,
  })
  user_name!: string | null;

  @Column({
    type: "varchar",
    length: 200,
    unique: true,
    nullable: true,
  })
  email!: string | null;

  @Column({
    type: "varchar",
    length: 200,
    nullable: true,
  })
  password!: string | null;

  @Column({
    type: "text",
    nullable: true,
  })
  refresh_token!: string | null;

  @Column({
    type:"text",
    default: "user",
    nullable: true,
  })
  role!: string| null;

  @Column({
    type:"int",
    default: 0,
  })
  token_version!: number;

  @OneToMany(() => Post, (post) => post.user)
  posts!: Post[];

  @OneToMany(() => Media, (media) => media.user)
  media!: Media[];

  @OneToMany(() => Like, (like) => like.user)
  likes!: Like[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages!: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages!: Message[];
}