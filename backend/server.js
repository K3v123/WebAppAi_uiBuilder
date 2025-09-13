// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import mongoose from "mongoose";

dotenv.config();

console.log("MONGO_URI:", process.env.MONGO_URI); // debug log
const USE_LOCAL_AI = false; // ← Set to true to use LM Studio, false for Google Gemini

if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not defined in .env file!");
    process.exit(1);
  }

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ========== MONGODB SETUP ==========
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// App Design Schema
const AppDesignSchema = new mongoose.Schema({
  appName: { type: String, required: true },
  description: { type: String, required: true },
  entities: [{ type: String }],
  roles: [{ type: String }],
  features: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const AppDesign = mongoose.model('AppDesign', AppDesignSchema);
// ===================================

// Simple test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Save app design
app.post("/api/save-app", async (req, res) => {
  try {
    const { appName, description, entities, roles, features } = req.body;
    const newApp = new AppDesign({ appName, description, entities, roles, features });
    await newApp.save();
    res.json({ success: true, appId: newApp._id });
  } catch (error) {
    console.error("Save app error:", error);
    res.status(500).json({ error: "Failed to save app" });
  }
});

// Get all saved apps
app.get("/api/load-apps", async (req, res) => {
  try {
    const apps = await AppDesign.find().sort({ createdAt: -1 });
    res.json(apps);
  } catch (error) {
    console.error("Load apps error:", error);
    res.status(500).json({ error: "Failed to load apps" });
  }
});

// AI Requirement Parsing Route
app.post("/api/parse-requirements", async (req, res) => {
  console.log("Incoming request to /api/parse-requirements");
  console.log("Parsed req.body:", req.body);

  if (!req.body?.description) {
    return res.status(400).json({ error: "Invalid or missing 'description'" });
  }

  const { description } = req.body;

  try {
    let result;

    if (USE_LOCAL_AI) {
      // ========== LM STUDIO MODE ==========
      console.log("Using LM Studio (local AI)");
      const localResponse = await axios.post('http://localhost:1234/v1/chat/completions', {
        model: "local-model",
        messages: [{
          role: "user",
          content: `
            Extract from this app description:
            - App Name (string)
            - List of Entities (max 5, array of strings)
            - List of Roles (max 5, array of strings)
            - List of Features (max 5, array of strings)

            Return as JSON with keys: appName, entities, roles, features

            Description: "${description}"
          `
        }],
        temperature: 0.2,
        max_tokens: 500
      });

      const localText = localResponse.data.choices[0].message.content;
      const jsonStart = localText.indexOf('{');
      const jsonEnd = localText.lastIndexOf('}') + 1;
      const jsonString = localText.slice(jsonStart, jsonEnd);

      result = JSON.parse(jsonString);

    } else {
      // ========== GOOGLE GEMINI MODE ==========
      console.log("Using Google Gemini (cloud AI)");
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `
                Extract from this app description:
                - App Name (string)
                - List of Entities (max 5, array of strings)
                - List of Roles (max 5, array of strings)
                - List of Features (max 5, array of strings)

                Return as JSON with keys: appName, entities, roles, features

                Description: "${description}"
              `
            }]
          }]
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const geminiText = geminiResponse.data.candidates[0].content.parts[0].text;
      const jsonStart = geminiText.indexOf('{');
      const jsonEnd = geminiText.lastIndexOf('}') + 1;
      const jsonString = geminiText.slice(jsonStart, jsonEnd);

      result = JSON.parse(jsonString);
    }

    // Validate
    if (!result.appName || !Array.isArray(result.entities)) {
      throw new Error("AI returned incomplete data");
    }

    console.log("AI successfully parsed:", result);
    res.json(result);

  } catch (error) {
    console.error("AI processing failed:", error.message);
    res.status(500).json({ 
      error: "Failed to process with AI", 
      details: error.message,
      mode: USE_LOCAL_AI ? "LM Studio" : "Google Gemini"
    });
  }
});

// Start server & connect to DB
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Test endpoint: GET http://localhost:${PORT}`);
    console.log(`Test AI parse: POST http://localhost:${PORT}/api/parse-requirements`);
    console.log(`Save app: POST http://localhost:${PORT}/api/save-app`);
    console.log(`Load apps: GET http://localhost:${PORT}/api/load-apps`);
  });
});