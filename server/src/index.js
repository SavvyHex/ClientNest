import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import clientRoutes from './routes/clientRoutes.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // your frontend
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/client', clientRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
