import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "./Users.js";
import { Media } from "./Media.js";
import { Like } from "./Like.js";
import { Comment } from "./Comments.js";
import { int } from "zod";

@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "text",
    nullable: true,
  })
  content!: string | null;

  @Column({
    type: "text",
    default: "all",
    nullable: true,
  })
  visiblity!: string | null;

  @Column({
    type:"int",
  nullable: true,
})
user_id!: number | null;


  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "user_id",
  })
  user!: User;

  @OneToMany(() => Media, (media) => media.post)
  media!: Media[];

  @OneToMany(() => Like, (like) => like.post)
  likes!: Like[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments!: Comment[];

  @CreateDateColumn({
    type: "timestamp",
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: "timestamp",
  })
  updated_at!: Date;
}