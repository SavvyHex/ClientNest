import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  plan: { type: String, default: "free" },
});

export default mongoose.model("User", userSchema);