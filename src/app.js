import express from "express";
import dotenv from "dotenv";
import { createTask } from "./controllers/task.controller.js";

dotenv.config();

const app = express();
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Task endpoint
app.post("/api/v1/tasks", createTask);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something broke!",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: "Not Found",
    suggestedRoutes: {
      health: "GET /health",
      createTask: "POST /api/tasks",
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (Process ID: ${process.pid})`);
});
