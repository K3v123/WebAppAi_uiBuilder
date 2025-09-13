// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' })); // Explicitly parse JSON, set max size

// Simple test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// AI Requirement Parsing Route
app.post("/api/parse-requirements", (req, res) => {
  // DEBUG: Log incoming request info
  console.log("➡️ Incoming request to /api/parse-requirements");
  console.log("Content-Type Header:", req.headers['content-type']);
  console.log("Parsed req.body:", req.body);

  // Check if body exists
  if (!req.body) {
    console.error("X Request body is undefined — likely invalid Content-Type or malformed JSON");
    return res.status(400).json({
      error: "Request body is missing or not JSON. Make sure Content-Type is 'application/json'."
    });
  }

  // Check if 'description' field exists
  const { description } = req.body;
  if (!description || typeof description !== 'string') {
    console.error("X 'description' field missing or not a string");
    return res.status(400).json({
      error: "Invalid input: 'description' must be a non-empty string."
    });
  }

  // Mock AI response (NEED TO replace this with real AI later)
  const result = {
    appName: "Course Manager",
    entities: ["Student", "Course", "Grade"],
    roles: ["Teacher", "Student", "Admin"],
    features: ["Add course", "Enroll students", "View reports"]
  };

  console.log("Successfully parsed. Returning mock result.");
  res.json(result);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint: GET http://localhost:${PORT}`);
  console.log(`Test AI parse: POST http://localhost:${PORT}/api/parse-requirements`);
});