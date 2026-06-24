import express from "express";
import cors from "cors";
import path from "path";
import { errorHandler } from "./middlewares/errorHandler.ts";
import { router } from "./routes/index.ts";

export const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.resolve("uploads")));

// Routes
app.use("/api", router);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use(errorHandler);