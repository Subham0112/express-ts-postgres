import express from "express";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
dotenv.config();
const app = express();
const port = Number(process.env.PORT) || 3000;
pool.connect().then(() => {
    console.log("successfully connected to db ");
}).catch((err) => {
    console.log("Error connecting to database", err);
});
app.get("/", (req, res) => {
    res.send("Express Setup with ts and typescript");
});
app.listen(port, () => {
    console.log("Server is running in port", port);
});
//# sourceMappingURL=index.js.map