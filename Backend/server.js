import "./config/env.js"; // Load environment first
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import fileRoutes from "./routes/files.js";
import userRoutes from "./routes/users.js";
import { db } from "./config/firebase.js"; // Added for file access routes

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Backend running", status: "healthy" });
});

// Routes for public and protected file access
// New GET route for direct downloads
app.get("/:accessLevel/:fileId", async (req, res) => {
  try {
    const { accessLevel, fileId } = req.params;
    const fileDoc = await db.collection("files").doc(fileId).get();

    if (!fileDoc.exists) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    const fileData = fileDoc.data();

    if (fileData.accessLevel !== accessLevel) {
      return res
        .status(403)
        .json({ success: false, error: "Invalid access level" });
    }

    if (fileData.expireAt && new Date(fileData.expireAt) < new Date()) {
      return res.status(410).json({ success: false, error: "File expired" });
    }

    if (accessLevel === "public") {
      const gcsFile = bucket.file(fileData.storagePath);
      const [buffer] = await gcsFile.download();
      res.setHeader("Content-Type", fileData.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileData.originalName}"`
      );
      return res.send(buffer);
    } else if (accessLevel === "protected") {
      // Requires authentication or password (implement token/password check)
      if (!req.headers.authorization) {
        return res
          .status(401)
          .json({ success: false, error: "Authentication required" });
      }
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (decodedToken.uid !== fileData.ownerId) {
        return res.status(403).json({ success: false, error: "Access denied" });
      }
      const gcsFile = bucket.file(fileData.storagePath);
      const [buffer] = await gcsFile.download();
      res.setHeader("Content-Type", fileData.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileData.originalName}"`
      );
      return res.send(buffer);
    }

    return res.status(403).json({ success: false, error: "Access denied" });
  } catch (error) {
    console.error("❌ Download error:", error.message);
    res.status(500).json({
      success: false,
      error: "Download failed",
      message: error.message,
    });
  }
});

app.get("/protected/:fileId", (req, res) => {
  const { fileId } = req.params;
  // Render a password input page
  res.send(`
    <html>
      <body>
        <h3>Enter Password</h3>
        <form action="/api/files/download/${fileId}" method="POST">
          <input type="password" name="password" />
          <button type="submit">Submit</button>
        </form>
      </body>
    </html>
  `);
});

// Serve frontend dist in production
const frontendPath = path.join(__dirname, "../Frontend/dist");
app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"), (err) => {
    if (err) {
      res.status(404).json({ error: "Frontend not built" });
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: "Internal error", message: err.message });
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on https://localhost:${PORT}`);
});
