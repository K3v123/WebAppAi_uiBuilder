// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ========== MONGODB SETUP ==========
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/appbuilder";

mongoose.connect(mongoUri)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// App Design Schema
const appSchema = new mongoose.Schema({
  appName: { type: String, required: true },
  entities: { type: [String], required: true },
  roles: { type: [String], required: true },
  features: { type: [String], required: true },
  description: { type: String, required: true },
}, { timestamps: true });

const SavedApp = mongoose.model("SavedApp", appSchema);
// ===================================

// Simple test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ========== AI Requirement Parsing Route ==========
app.post("/api/parse-requirements", async (req, res) => {
  console.log("Incoming request to /api/parse-requirements");
  console.log("Parsed req.body:", req.body);

  if (!req.body?.description) {
    return res.status(400).json({ error: "Invalid or missing 'description'" });
  }

  const { description } = req.body;

  try {
    let result;

    if (process.env.USE_LOCAL_AI === "true") {
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
      console.log("Using Google Gemini (cloud AI)");
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const geminiText = geminiResponse.data.candidates[0].content.parts[0].text;
      result = JSON.parse(geminiText);
    }

    if (!result.appName || !Array.isArray(result.entities) || !Array.isArray(result.roles) || !Array.isArray(result.features)) {
      throw new Error("AI returned incomplete data");
    }

    console.log("✅ AI successfully parsed:", result);
    res.json(result);

  } catch (error) {
    console.error("❌ AI processing failed:", error.message);
    res.status(500).json({ 
      error: "Failed to process with AI", 
      details: error.message,
      mode: process.env.USE_LOCAL_AI === "true" ? "LM Studio" : "Google Gemini"
    });
  }
});

// ========== UI CUSTOMIZATION ROUTE ==========
app.post("/api/customize-ui", async (req, res) => {
  console.log("Incoming request to /api/customize-ui");
  console.log("Parsed req.body:", req.body);

  if (!req.body?.instruction) {
    return res.status(400).json({ error: "Missing 'instruction'" });
  }

  // Default currentUI if not provided
  const currentUI = req.body.currentUI || {};

  try {
    let result;

    if (process.env.USE_LOCAL_AI === "true") {
      console.log("Using LM Studio for UI customization");
      const localResponse = await axios.post('http://localhost:1234/v1/chat/completions', {
        model: "local-model",
        messages: [{
          role: "user",
          content: `
            You are a UI customization assistant. Based on the user's instruction, generate CSS style overrides.
            
            Current UI styles: ${JSON.stringify(currentUI)}
            User instruction: "${instruction}"
            
            Return ONLY a JSON object with style overrides. Valid keys are:
            - formBackground (CSS color)
            - buttonColor (CSS color) 
            - fontSize (CSS font size)
            - borderRadius (CSS border radius)
            
            Examples:
            - "make save buttons blue" -> {"buttonColor": "#0000ff"}
            - "darker background" -> {"formBackground": "#1a1a1a"}
            - "larger text" -> {"fontSize": "1.3rem"}
            
            If the instruction is unclear, return an empty object {}.
          `
        }],
        temperature: 0.2,
        max_tokens: 200
      });

      const localText = localResponse.data.choices[0].message.content;
      const jsonStart = localText.indexOf('{');
      const jsonEnd = localText.lastIndexOf('}') + 1;
      const jsonString = localText.slice(jsonStart, jsonEnd);
      result = JSON.parse(jsonString || '{}');

    } else {
      console.log("Using Google Gemini for UI customization");
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `
                You are a UI customization assistant. Based on the user's instruction, generate CSS style overrides.
                
                Current UI styles: ${JSON.stringify(currentUI)}
                User instruction: "${req.body.instruction}"
                
                Return ONLY a JSON object with style overrides. Valid keys are:
                - formBackground (CSS color)
                - buttonColor (CSS color) 
                - fontSize (CSS font size)
                - borderRadius (CSS border radius)
                
                Examples:
                - "make save buttons blue" -> {"buttonColor": "#0000ff"}
                - "darker background" -> {"formBackground": "#1a1a1a"}
                - "larger text" -> {"fontSize": "1.3rem"}
                
                If the instruction is unclear, return an empty object {}.
              `
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const geminiText = geminiResponse.data.candidates[0].content.parts[0].text;
      result = JSON.parse(geminiText || '{}');
    }

    // Ensure result is a plain object with allowed keys only
    const allowedKeys = ['formBackground', 'buttonColor', 'fontSize', 'borderRadius'];
    const sanitized = {};
    for (const key of allowedKeys) {
      if (result[key] !== undefined) {
        sanitized[key] = result[key];
      }
    }

    console.log("✅ AI generated style overrides:", sanitized);
    res.json({ styleOverrides: sanitized });

  } catch (error) {
    console.error("❌ UI customization failed:", error.message);
    res.status(500).json({ 
      error: "Failed to process UI customization", 
      details: error.message,
      mode: process.env.USE_LOCAL_AI === "true" ? "LM Studio" : "Google Gemini"
    });
  }
});
// =======================================

// ========== SAVE APP ROUTE ==========
app.post("/api/save-app", async (req, res) => {
  try {
    const { appName, entities, roles, features, description } = req.body;

    if (!appName || !Array.isArray(entities) || !Array.isArray(roles) || !Array.isArray(features) || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newApp = new SavedApp({
      appName,
      entities,
      roles,
      features,
      description
    });

    await newApp.save();
    console.log("App saved to MongoDB:", newApp.appName);
    res.status(201).json({ message: "App saved successfully", id: newApp._id });
  } catch (error) {
    console.error("❌ Save error:", error.message);
    res.status(500).json({ error: "Failed to save app" });
  }
});

// ========== LOAD APPS ROUTE ==========
app.get("/api/load-apps", async (req, res) => {
  try {
    const apps = await SavedApp.find().sort({ createdAt: -1 });
    console.log(`Loaded ${apps.length} saved apps`);
    res.json(apps);
  } catch (error) {
    console.error("❌ Load apps error:", error.message);
    res.status(500).json({ error: "Failed to load apps" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint: GET http://localhost:${PORT}`);
  console.log(`Test AI parse: POST http://localhost:${PORT}/api/parse-requirements`);
  console.log(`Test UI customize: POST http://localhost:${PORT}/api/customize-ui`);
  console.log(`Test save: POST http://localhost:${PORT}/api/save-app`);
  console.log(`Test load: GET http://localhost:${PORT}/api/load-apps`);
});