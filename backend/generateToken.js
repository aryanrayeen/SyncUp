import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const user = {
  id: "68925d254da36b162d2bcf45", // this is the _id of your manually inserted user
};

const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

console.log("Your test JWT token:");
console.log(token);
