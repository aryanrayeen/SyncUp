import express from "express";
import {connectDB} from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004

connectDB().then(() => {
    app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
});
});