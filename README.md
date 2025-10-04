# 🧠 WebApp AI UI Builder
> *An intern evaluation task, built with heart and no regrets.*

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)
![React](https://img.shields.io/badge/React-18%2B-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-%E2%9C%93-brightgreen?logo=mongodb)
![Gemini AI](https://img.shields.io/badge/Gemini_2.5--Flash-AI_Powered-orange)

Turn plain English app ideas into structured forms, **instantly**. Then, customize the UI with natural language like *"make buttons blue"* or *"darker theme"*. All powered by AI.

> 💬 *"I messed up... So I built what they wanted (improved) with no regrets."*

## ✨ Features

- **AI-Powered Requirement Parsing**  
  Describe your app in plain text → AI extracts:
  - App Name
  - Entities (e.g., Student, Course)
  - Roles (e.g., Admin, Teacher)
  - Features (e.g., Enroll, Generate Report)

- **Dynamic UI Customization**  
  Use natural language to change the look:
  - `"Larger text"`
  - `"Professional theme"`
  - `"Rounded corners"`
  - `"Red save buttons"`

- **Save & Load Apps**  
  Persist your designs to MongoDB and revisit them anytime.

- **Flexible AI Backend**  
  Supports:
  - ✅ **Google Gemini 2.5 Flash** (recommended)
  - 🔁 LM Studio (local LLMs)
  - ❌ OpenRouter/GLM-4.5-Air (limited by token output — truncation issues)

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js + Express
- **Database**: MongoDB (via Mongoose)
- **AI**: Google Gemini 2.5 Flash (cloud) or LM Studio (local)
- **Security**: `.env` encryption optional via [dotenvx](https://dotenvx.com) (not required)

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/your-username/WebAppAi_uiBuilder.git
cd WebAppAi_uiBuilder
```

### Set up backend
```bash
cd backend
npm install
```

Create a .env file in backend/:

# Required
```bash
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
MONGO_URI=mongodb://localhost:27017/appbuilder  # or your Atlas URI

# Optional: use local AI instead
# USE_LOCAL_AI=true
```

# Run backend
```bash
npm run dev
```
# Server runs on http://localhost:5000


# Set up frontend
```bash
cd ../frontend
npm install
npm run dev
```
# App runs on http://localhost:5173

Why Gemini 2.5 Flash? 

    GLM-4.5-Air (free via OpenRouter) often truncates responses due to token limits (finish_reason: "length"), breaking JSON parsing.
    Gemini 2.5 Flash (when available) provides reliable, full JSON output — especially with responseMimeType: "application/json".
     

    ⚠️ Note: As of Oct 2025, gemini-2.5-flash may be an internal/preview model. If it fails, fall back to gemini-1.5-flash-latest. 
     

Final Note 

This project was built during an internship evaluation, not to impress, but to learn, create, and move forward.
No regrets. Just code and coffee.
