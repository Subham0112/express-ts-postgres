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
app.post("/users", async (req, res) => {
    try {
        const name = "Subham Khatiwada";
        const email = "subham123@gmail.com";
        const result = await pool.query("INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *", [name, email]);
        res.status(201).json(result.rows[0]);
        console.log("User created successfully", result.rows[0]);
    }
    catch (err) {
        console.error("Error creating user", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.get("/", (req, res) => {
    res.send("Express Setup with ts and typescript");
});
app.listen(port, () => {
    console.log("Server is running in port", port);
});
//# sourceMappingURL=index.js.map