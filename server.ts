import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

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

/*
|--------------------------------------------------------------------------
| JULIET'S STORE CATALOG
|--------------------------------------------------------------------------
| IMPORTANT:
| These IDs MUST match src/data/mockData.ts
|
| Gemini is ONLY allowed to recommend products listed here.
|--------------------------------------------------------------------------
*/

const STORE_PRODUCTS = [
  {
    id: "prod_001",
    name: "Hydrating Primer Serum",
    priceKSh: 1200,
    category: "Skincare",
    description:
      "A lightweight hydrating primer serum that helps prepare the skin for smooth makeup application.",
  },
  {
    id: "prod_002",
    name: "Nairobi Glow Liquid Highlighter",
    priceKSh: 1500,
    category: "Glow",
    description:
      "A radiant liquid highlighter designed to give the cheekbones a beautiful golden glow.",
  },
  {
    id: "prod_003",
    name: "Matte Finish Setting Powder",
    priceKSh: 1000,
    category: "Face",
    description:
      "A lightweight setting powder designed to reduce excess shine while keeping makeup looking fresh.",
  },
];

/*
|--------------------------------------------------------------------------
| SKIN SCAN
|--------------------------------------------------------------------------
*/

app.post("/api/gemini/skin-scan", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error:
          "GEMINI_API_KEY environment variable is not configured.",
      });
    }

    const {
      imageBase64,
      mimeType = "image/jpeg",
      notes,
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: "Image data is required for skin scan.",
      });
    }

    const cleanBase64 = imageBase64.replace(
      /^data:image\/\w+;base64,/,
      ""
    );

    /*
    |--------------------------------------------------------------------------
    | BUILD STORE CATALOG FOR JULIET
    |--------------------------------------------------------------------------
    */

    const catalogText = STORE_PRODUCTS.map(
      (product) =>
        `ID: ${product.id}
Name: ${product.name}
Price: KSh ${product.priceKSh}
Category: ${product.category}
Description: ${product.description}`
    ).join("\n\n");

    const prompt = `
You are Juliet, the expert beauty assistant and founder of Juliet's Makeup Galore in Nairobi, Kenya.

Analyze the user's facial image carefully.

Look at visible characteristics such as:
- apparent skin type
- visible hydration
- visible dryness
- visible shine
- visible texture
- visible redness
- visible complexion tone
- apparent undertone

IMPORTANT:
This is a cosmetic guidance experience, not a medical diagnosis.
Do not diagnose medical skin conditions.

YOUR STORE CATALOG
==================

${catalogText}

STRICT PRODUCT RULES
====================

You may ONLY recommend products from the store catalog above.

NEVER:
- invent a product
- invent a product ID
- invent a price
- recommend a product that is not in the catalog
- create a product name that is not in the catalog

The "id" in recommendedProducts MUST EXACTLY match one of these IDs:

${STORE_PRODUCTS.map((p) => p.id).join(", ")}

The "name" MUST EXACTLY match the corresponding store product name.

The price should NEVER be included in your recommendation reason because the application gets the real price directly from the store catalog.

If none of the store products are suitable, return an empty recommendedProducts array.

Only recommend products that genuinely make sense for the user's visible characteristics.

You can recommend between 0 and 3 products.

${notes ? `USER NOTES:\n${notes}` : ""}

RETURN THIS JSON:

{
  "overallSkinType": "Dry" | "Oily" | "Combination" | "Normal" | "Sensitive",
  "glowScore": integer between 1 and 100,
  "hydrationLevel": "Optimal" | "Slightly Dehydrated" | "Dehydrated" | "Moisturized",
  "undertone": "Warm Golden" | "Cool Rose" | "Neutral Olive" | "Rich Espresso",
  "keyObservations": [
    "observation 1",
    "observation 2",
    "observation 3"
  ],
  "concernsDetected": [
    "concern 1",
    "concern 2"
  ],
  "skincareAdvice": "2-3 warm encouraging sentences from Juliet.",
  "recommendedProducts": [
    {
      "id": "EXACT STORE PRODUCT ID",
      "name": "EXACT STORE PRODUCT NAME",
      "reason": "Why this specific store product suits the visible characteristics."
    }
  ]
}
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
            overallSkinType: {
              type: Type.STRING,
            },

            glowScore: {
              type: Type.INTEGER,
            },

            hydrationLevel: {
              type: Type.STRING,
            },

            undertone: {
              type: Type.STRING,
            },

            keyObservations: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },

            concernsDetected: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },

            skincareAdvice: {
              type: Type.STRING,
            },

            recommendedProducts: {
              type: Type.ARRAY,

              items: {
                type: Type.OBJECT,

                properties: {
                  id: {
                    type: Type.STRING,
                  },

                  name: {
                    type: Type.STRING,
                  },

                  reason: {
                    type: Type.STRING,
                  },
                },

                required: [
                  "id",
                  "name",
                  "reason",
                ],
              },
            },
          },

          required: [
            "overallSkinType",
            "glowScore",
            "hydrationLevel",
            "undertone",
            "keyObservations",
            "concernsDetected",
            "skincareAdvice",
            "recommendedProducts",
          ],
        },
      },
    });

    const jsonText = response.text || "{}";

    const data = JSON.parse(jsonText);

    /*
    |--------------------------------------------------------------------------
    | FINAL SECURITY CHECK
    |--------------------------------------------------------------------------
    | Even if Gemini somehow returns an invalid product,
    | we remove it before sending the result to the app.
    |--------------------------------------------------------------------------
    */

    const validProductIds = new Set(
      STORE_PRODUCTS.map((product) => product.id)
    );

    const safeRecommendations = Array.isArray(
      data.recommendedProducts
    )
      ? data.recommendedProducts.filter(
          (product: any) =>
            product &&
            validProductIds.has(product.id)
        )
      : [];

    const finalResult = {
      ...data,
      recommendedProducts: safeRecommendations,
    };

    res.json(finalResult);
  } catch (err: any) {
    console.error("Juliet Skin Scan API Error:", err);

    res.status(500).json({
      error:
        err.message ||
        "Skin scan analysis failed.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| JULIET BEAUTY CHAT
|--------------------------------------------------------------------------
*/

app.post("/api/gemini/chat", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error:
          "GEMINI_API_KEY environment variable is not configured.",
      });
    }

    const {
      history = [],
      message,
    } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required.",
      });
    }

    const catalogText = STORE_PRODUCTS.map(
      (product) =>
        `- ${product.name} — KSh ${product.priceKSh} — ${product.category}`
    ).join("\n");

    const systemInstruction = `
You are Juliet, the warm, stylish and knowledgeable beauty assistant and founder of Juliet's Makeup Galore in Nairobi, Kenya.

Help customers with:
- skincare preparation
- makeup techniques
- product selection
- beauty routines
- shade guidance
- store products
- artist services

IMPORTANT STORE RULE:

Only talk about products that exist in this store catalog.

CURRENT STORE CATALOG:

${catalogText}

Never invent products.

Never invent prices.

If a customer asks about a product that is not in the catalog, explain that it is not currently available and suggest one of the available products when appropriate.

Keep your answers warm, conversational and concise.

Use clean line breaks and occasional beauty emojis.

ARTIST SERVICES:

- Bridal Glam & Touchup — KSh 8,500
- Evening & Red Carpet Glam — KSh 5,000
- Editorial & Studio Photoshoot — KSh 6,500
- 1-on-1 Personal Beauty Masterclass — KSh 4,000
`;

    const contents = [
      ...history.map((h: any) => ({
        role: h.role,
        parts: [
          {
            text: h.text || h.message || "",
          },
        ],
      })),

      {
        role: "user",
        parts: [
          {
            text: message,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents,

      config: {
        systemInstruction,
      },
    });

    const reply =
      response.text ||
      "I'm so glad you asked! How else can I help you sparkle today? ♡";

    res.json({
      reply,
    });
  } catch (err: any) {
    console.error("Juliet Chat Error:", err);

    res.status(500).json({
      error:
        err.message ||
        "Failed to process chat with Juliet.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },

      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(
      process.cwd(),
      "dist"
    );

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(
        path.join(distPath, "index.html")
      );
    });
  }

  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        `Juliet's Makeup Galore running on http://localhost:${PORT}`
      );
    }
  );
}

startServer();