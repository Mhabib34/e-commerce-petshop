// import express from "express";
// import cors from "cors";
// import path from "path";
// import { errorHandler } from "./middlewares/errorHandler.ts";
// import { router } from "./routes/index.ts";

// export const app = express();

// // Middlewares
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Static files
// app.use("/uploads", express.static(path.resolve("uploads")));

// // Routes
// app.use("/api", router);

// // 404 handler
// app.use((_req, res) => {
//   res.status(404).json({ success: false, message: "Route not found" });
// });

// // Global error handler
// app.use(errorHandler);

import express from "express";
import cors from "cors";
import path from "path";
import { errorHandler } from "./middlewares/errorHandler.ts";
import { router } from "./routes/index.ts";

export const app = express();

// Middlewares
const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // izinkan request tanpa origin (misal dari Postman/mobile native)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) // izinkan semua localhost:port saat dev
      ) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
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