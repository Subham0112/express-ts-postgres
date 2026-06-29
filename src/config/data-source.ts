import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";

import { User } from "../entities/Users.js";
import { Post } from "../entities/Posts.js";
import { Media } from "../entities/Media.js";
import { Like } from "../entities/Like.js";
import { Comment } from "../entities/Comments.js";
import { Message } from "../entities/Message.js";
import { Otp } from "../entities/Otp.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT!),
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,

  synchronize: false,
  logging: false,

  entities: [
    User,
    Post,
    Media,
    Like,
    Comment,
    Message,
    Otp,
  ],
});