import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import {
  personalizeDailyVibe,
  analyzeDiaryEntry,
  runConfessionChat,
  translateExplainVerse,
  generateSacredMusic,
} from "./lib/geminiService";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});
// Dedicated video and static assets serving with full HTTP 206 Range stream support
app.get("/videos/sanctuary_diorama.mp4", (req, res) => {
  const filePath = path.join(process.cwd(), "public", "videos", "sanctuary_diorama.mp4");
  res.sendFile(filePath);
});
app.get("/sanctuary_diorama_poster.jpg", (req, res) => {
  const filePath = path.join(process.cwd(), "public", "sanctuary_diorama_poster.jpg");
  res.sendFile(filePath);
});

// Privacy Policy route for Google Play Store compliance & public review
app.get(["/privacy", "/privacy-policy", "/privacy.html", "/privacy-policy.html"], (req, res) => {
  const filePath = path.join(process.cwd(), "public", "privacy.html");
  res.sendFile(filePath);
});
// Direct APK download route with attachment headers
app.get([
  "/sacred-reflection-diary.apk", 
  "/app-release.apk", 
  "/Positron-Sanctuary-Offline.apk", 
  "/Positron.apk", 
  "/download-apk", 
  "/apk", 
  "/api/download/apk"
], (req, res) => {
  const filePath = path.join(process.cwd(), "public", "sacred-reflection-diary.apk");
  res.setHeader("Content-Type", "application/vnd.android.package-archive");
  res.setHeader("Content-Disposition", 'attachment; filename="Positron-Sanctuary-Offline.apk"');
  res.sendFile(filePath);
});
// Direct AAB (Android App Bundle for Google Play Store) download route with attachment headers
app.get([
  "/sacred-reflection-diary.aab", 
  "/app-release.aab", 
  "/download-aab", 
  "/aab",
  "/sacred-reflection-diary.abb",
  "/app-release.abb",
  "/download-abb",
  "/abb",
  "/api/download/aab"
], (req, res) => {
  const filePath = path.join(process.cwd(), "public", "sacred-reflection-diary.aab");
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Disposition", 'attachment; filename="Positron-Sanctuary.aab"');
  res.sendFile(filePath);
});
// Serve static assets from public folder before other middlewares
app.use(express.static(path.join(process.cwd(), "public")));

// API: Personalize entire application vibe based on current problem, mood, and life situation
app.post("/api/personalize-vibe", async (req, res) => {
  try {
    const result = await personalizeDailyVibe(req.body || {});
    res.json(result);
  } catch (error: any) {
    console.error("Personalization API Error:", error);
    res.status(error?.statusCode || 500).json({ error: error.message || "Failed to customize daily application vibe." });
  }
});

// API: Analyze diary entry using server-side Gemini API
app.post("/api/diary-analyze", async (req, res) => {
  try {
    const result = await analyzeDiaryEntry(req.body?.content);
    res.json(result);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(error?.statusCode || 500).json({ error: error.message || "Failed to analyze diary entry." });
  }
});

// API: Simultaneous interactive dialogue for user confessions, doubts, and real conversation
app.post("/api/confession-chat", async (req, res) => {
  try {
    const result = await runConfessionChat(req.body || {});
    res.json(result);
  } catch (error: any) {
    console.error("Confession Chat API Error:", error);
    res.status(error?.statusCode || 500).json({ error: error.message || "Failed to process reflection." });
  }
});

// API: Translate and explain sacred verse into preferred language
app.post("/api/translate-explain", async (req, res) => {
  try {
    const result = await translateExplainVerse(req.body || {});
    res.json(result);
  } catch (error: any) {
    console.error("Translate-Explain API Error:", error);
    res.status(error?.statusCode || 500).json({ error: error.message || "Failed to translate and explain." });
  }
});

// API: Generate spiritual / ambient music using Lyria model with harmonic synthesis fallback
app.post("/api/generate-music", async (req, res) => {
  try {
    const result = await generateSacredMusic(req.body || {});
    res.json(result);
  } catch (error: any) {
    console.error("Music Generation API Error:", error);
    res.status(error?.statusCode || 500).json({ error: error.message || "Failed to generate music clip." });
  }
});

// Setup Vite Dev server or production static serving
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

initializeServer().catch((err) => {
  console.error("Failed to start server", err);
});
