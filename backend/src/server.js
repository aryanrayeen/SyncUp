import express from "express";
import {connectDB} from "./config/db.js";
import dotenv from "dotenv";
import fitnessRoutes from "./routes/fitness.route.js"; // <-- Add this line

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004

app.use(express.json());
app.use("/api/fitness", fitnessRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
});
});