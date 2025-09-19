import express, { Request, Response, Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import authRoutes from "../routes/auth.js";
import fileRoutes from "../routes/files.js";
import userRoutes from "../routes/users.js";

// Load environment variables first
dotenv.config();

// Type assertion to satisfy TypeScript
const app: Express = express();
const PORT: number = parseInt(process.env.PORT || "5000", 10);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

// Type assertion for routes
app.use("/api/auth", authRoutes as any); // Temporary type assertion
app.use("/api/files", fileRoutes as any); // Temporary type assertion
app.use("/api/users", userRoutes as any); // Temporary type assertion

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ message: "Backend running", status: "healthy" });
});

console.log("Loaded GCP_BUCKET_NAME:", process.env.GCP_BUCKET_NAME); // Debug log
app.listen(PORT, () => {
  console.log(`✅ Backend running on https://localhost:${PORT}`);
});
