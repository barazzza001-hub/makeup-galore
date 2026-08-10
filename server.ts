import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase body parser limit for base64 camera images
app.use(express.json({ limit: "25mb" }));

// Initialize Gemini SDK with server-side API Key
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Skin Scan Endpoint
app.post("/api/gemini/skin-scan", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is not configured.",
      });
    }

    const { imageBase64, mimeType = "image/jpeg", notes } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Image data is required for skin scan." });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `You are Juliet, an expert aesthetician and lead makeup artist at Juliet's Makeup Galore in Nairobi. Analyze this user's facial skin photo carefully.

Examine skin texture, tone, moisture/hydration levels, redness, T-zone shine, or dry spots.
Match their analysis with products available in Juliet's Nairobi store:
Store Catalog:
- "Nairobi Glow Liquid Highlighter" (id: "prod_1") - KSh 2,800 (For dewy radiance, dull or dry skin)
- "Velvet Lip Satin" (id: "prod_2") - KSh 1,800 (Nourishing lip color with vitamin E)
- "Soft Bloom Powder Blush" (id: "prod_3") - KSh 2,200 (Velvety cheek flush)
- "Glass Lip Oil" (id: "prod_4") - KSh 1,500 (Deep jojoba & rosehip moisture for lips)
- "Lash Galore Volume Mascara" (id: "prod_5") - KSh 2,000 (Waterproof lash lengthener)
- "Matte Finish Setting Powder" (id: "prod_6") - KSh 2,500 (Ultra-fine oil control powder for T-zone/shine)
- "Hydrating Primer Serum" (id: "prod_7") - KSh 3,200 (Hyaluronic prep for texture & long wear)

${notes ? `User notes: "${notes}"` : ""}

Return a JSON object with:
1. overallSkinType: "Dry" | "Oily" | "Combination" | "Normal" | "Sensitive"
2. glowScore: integer score between 1 and 100
3. hydrationLevel: "Optimal" | "Slightly Dehydrated" | "Dehydrated" | "Moisturized"
4. undertone: "Warm Golden" | "Cool Rose" | "Neutral Olive" | "Rich Espresso"
5. keyObservations: array of 3 concise observations about their skin
6. concernsDetected: array of 1-2 detected skin concerns or null if none
7. skincareAdvice: 2-3 warm, encouraging sentences of personalized advice from Juliet
8. recommendedProducts: array of 2-3 objects, each with "id" (must be prod_1 to prod_7), "name", and "reason"
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSkinType: { type: Type.STRING },
            glowScore: { type: Type.INTEGER },
            hydrationLevel: { type: Type.STRING },
            undertone: { type: Type.STRING },
            keyObservations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            concernsDetected: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            skincareAdvice: { type: Type.STRING },
            recommendedProducts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["id", "name", "reason"],
              },
            },
          },
          required: [
            "overallSkinType",
            "glowScore",
            "hydrationLevel",
            "undertone",
            "keyObservations",
            "skincareAdvice",
            "recommendedProducts",
          ],
        },
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (err: any) {
    console.error("Skin Scan API Error:", err);
    res.status(500).json({ error: err.message || "Skin scan analysis failed." });
  }
});

// Chatbot Endpoint (Juliet AI Beauty Assistant)
app.post("/api/gemini/chat", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is not configured.",
      });
    }

    const { history = [], message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const systemInstruction = `You are Juliet, the warm, stylish, encouraging, and highly knowledgeable lead makeup artist & beauty founder at Juliet's Makeup Galore in Nairobi, Kenya.

Your goal is to guide clients on skin prep, shade selection, makeup techniques, and booking artist sessions.
Our Store Products:
- Nairobi Glow Liquid Highlighter (KSh 2,800)
- Velvet Lip Satin (KSh 1,800)
- Soft Bloom Powder Blush (KSh 2,200)
- Glass Lip Oil (KSh 1,500)
- Lash Galore Volume Mascara (KSh 2,000)
- Matte Finish Setting Powder (KSh 2,500)
- Hydrating Primer Serum (KSh 3,200)

Artist Booking Services:
- Bridal Glam & Touchup (KSh 8,500)
- Evening & Red Carpet Glam (KSh 5,000)
- Editorial & Studio Photoshoot (KSh 6,500)
- 1-on-1 Personal Beauty Masterclass (KSh 4,000)

Be warm, conversational, concise (2-3 short paragraphs max), and supportive with clean line breaks and emojis.`;

    const contents = [
      ...history.map((h: any) => ({
        role: h.role,
        parts: [{ text: h.text || h.message || "" }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || "I'm so glad you asked! How else can I help you sparkle today? ♡";
    res.json({ reply });
  } catch (err: any) {
    console.error("Juliet Chat Error:", err);
    res.status(500).json({ error: err.message || "Failed to process chat with Juliet." });
  }
});

// Start Express + Vite Dev or Production Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
