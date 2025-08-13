import mongoose from "mongoose";

const financeLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String },
});

export default mongoose.model("FinanceLog", financeLogSchema);
