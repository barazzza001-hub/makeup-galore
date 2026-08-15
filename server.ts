import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

/*
|--------------------------------------------------------------------------
| GEMINI
|--------------------------------------------------------------------------
*/

const rawApiKey = process.env.GEMINI_API_KEY;

const apiKey =
  rawApiKey &&
  rawApiKey.trim() &&
  rawApiKey !== "MY_GEMINI_API_KEY"
    ? rawApiKey.trim()
    : null;

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "juliets-makeup-galore",
      },
    },
  });
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function clamp(
  value: unknown,
  min = 0,
  max = 100
): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.max(
    min,
    Math.min(max, Math.round(number))
  );
}

function normalize(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: unknown): string[] {
  return normalize(value)
    .split(" ")
    .filter(
      (word) => word.length >= 3
    );
}

/*
|--------------------------------------------------------------------------
| PRODUCT CATEGORY NORMALIZATION
|--------------------------------------------------------------------------
|
| The server uses these categories to understand legitimate equivalents.
|--------------------------------------------------------------------------
*/

const synonymGroups: Record<string, string[]> = {
  moisturizer: [
    "moisturizer",
    "moisturiser",
    "hydrator",
    "hydrating cream",
    "face cream",
    "facial cream",
    "moisturizing cream",
    "moisturising cream",
  ],

  serum: [
    "serum",
    "face serum",
    "skin serum",
    "facial serum",
    "hydrating serum",
  ],

  cleanser: [
    "cleanser",
    "face cleanser",
    "facial cleanser",
    "face wash",
    "facial wash",
    "cleansing gel",
    "cleansing foam",
  ],

  sunscreen: [
    "sunscreen",
    "sun screen",
    "spf",
    "sun protection",
    "sunblock",
  ],

  primer: [
    "primer",
    "face primer",
    "makeup primer",
    "hydrating primer",
    "mattifying primer",
  ],

  powder: [
    "powder",
    "setting powder",
    "face powder",
    "loose powder",
    "pressed powder",
    "finishing powder",
  ],

  highlighter: [
    "highlighter",
    "liquid highlighter",
    "face highlighter",
    "illuminator",
    "illuminating powder",
  ],

  blush: [
    "blush",
    "cream blush",
    "liquid blush",
    "face blush",
  ],

  foundation: [
    "foundation",
    "face foundation",
    "liquid foundation",
    "cream foundation",
    "skin foundation",
  ],

  concealer: [
    "concealer",
    "face concealer",
    "under eye concealer",
    "under-eye concealer",
  ],

  toner: [
    "toner",
    "face toner",
    "facial toner",
  ],

  mask: [
    "mask",
    "face mask",
    "facial mask",
    "clay mask",
    "sheet mask",
  ],

  lip_product: [
    "lipstick",
    "lip gloss",
    "lipgloss",
    "lip balm",
    "lip oil",
    "lip liner",
    "lip product",
  ],
};

function findCanonicalCategory(
  value: unknown
): string | null {
  const normalized = normalize(value);

  if (!normalized) {
    return null;
  }

  for (const [
    canonical,
    terms,
  ] of Object.entries(
    synonymGroups
  )) {
    for (const term of terms) {
      const normalizedTerm =
        normalize(term);

      if (
        normalized === normalizedTerm ||
        normalized.includes(normalizedTerm) ||
        normalizedTerm.includes(normalized)
      ) {
        return canonical;
      }
    }
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| BUILD SAFE SHOP CATALOG
|--------------------------------------------------------------------------
*/

function buildSafeShopProducts(
  shopProducts: unknown
) {
  if (!Array.isArray(shopProducts)) {
    return [];
  }

  return shopProducts
    .filter(
      (product: any) =>
        product &&
        product.id &&
        product.name
    )
    .map((product: any) => ({
      id: String(product.id),
      name: String(product.name),
      category: String(
        product.category || ""
      ),
      description: String(
        product.description || ""
      ),
      priceKSh:
        typeof product.priceKSh === "number"
          ? product.priceKSh
          : undefined,
    }));
}

/*
|--------------------------------------------------------------------------
| PRODUCT MATCH SCORING
|--------------------------------------------------------------------------
|
| This is deliberately conservative.
|
| 100 = very strong match
| 80  = strong match
| 60  = possible match
| below 60 = do not recommend
|--------------------------------------------------------------------------
*/

function scoreProductMatch(
  recommendation: any,
  product: any
): number {
  const recommendationType =
    String(
      recommendation.productType || ""
    );

  const recommendationCategory =
    String(
      recommendation.category || ""
    );

  const productName =
    String(product.name || "");

  const productCategory =
    String(product.category || "");

  const productDescription =
    String(product.description || "");

  const recommendedCanonical =
    findCanonicalCategory(
      recommendationType
    ) ||
    findCanonicalCategory(
      recommendationCategory
    );

  const productCanonical =
    findCanonicalCategory(
      productCategory
    ) ||
    findCanonicalCategory(
      productName
    );

  let score = 0;

  /*
  |--------------------------------------------------------------------------
  | CATEGORY MATCH
  |--------------------------------------------------------------------------
  */

  if (
    recommendedCanonical &&
    productCanonical
  ) {
    if (
      recommendedCanonical ===
      productCanonical
    ) {
      score += 65;
    } else {
      /*
      Different product category.
      Do not allow description keywords
      to rescue an obviously wrong category.
      */
      return 0;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | EXACT PRODUCT TYPE
  |--------------------------------------------------------------------------
  */

  const normalizedRecommendation =
    normalize(recommendationType);

  const normalizedName =
    normalize(productName);

  const normalizedCategory =
    normalize(productCategory);

  if (
    normalizedRecommendation &&
    normalizedName.includes(
      normalizedRecommendation
    )
  ) {
    score += 30;
  }

  if (
    normalizedRecommendation &&
    normalizedCategory.includes(
      normalizedRecommendation
    )
  ) {
    score += 25;
  }

  /*
  |--------------------------------------------------------------------------
  | CATEGORY WORD OVERLAP
  |--------------------------------------------------------------------------
  */

  const recommendationWords = new Set(
    tokenize(
      `${recommendationType} ${recommendationCategory}`
    )
  );

  const productWords = new Set(
    tokenize(
      `${productName} ${productCategory}`
    )
  );

  let wordMatches = 0;

  for (const word of recommendationWords) {
    if (productWords.has(word)) {
      wordMatches++;
    }
  }

  score += Math.min(
    wordMatches * 10,
    25
  );

  /*
  |--------------------------------------------------------------------------
  | DESCRIPTION
  |--------------------------------------------------------------------------
  |
  | Description can support a match but can NEVER create
  | a category match on its own.
  |--------------------------------------------------------------------------
  */

  const descriptionText =
    normalize(productDescription);

  let descriptionMatches = 0;

  for (const word of recommendationWords) {
    if (
      descriptionText.includes(word)
    ) {
      descriptionMatches++;
    }
  }

  score += Math.min(
    descriptionMatches * 3,
    10
  );

  return Math.min(score, 100);
}

/*
|--------------------------------------------------------------------------
| FIND BEST SHOP PRODUCT
|--------------------------------------------------------------------------
*/

function findBestProductMatch(
  recommendation: any,
  shopProducts: any[]
) {
  let bestProduct: any = null;
  let bestScore = 0;

  for (const product of shopProducts) {
    const score =
      scoreProductMatch(
        recommendation,
        product
      );

    if (
      score > bestScore
    ) {
      bestScore = score;
      bestProduct = product;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | IMPORTANT:
  |
  | We require a genuinely strong match.
  |--------------------------------------------------------------------------
  */

  if (
    bestProduct &&
    bestScore >= 70
  ) {
    return {
      product: bestProduct,
      score: bestScore,
    };
  }

  return {
    product: null,
    score: bestScore,
  };
}

/*
|--------------------------------------------------------------------------
| JULIET AI SKIN SCAN
|--------------------------------------------------------------------------
*/

app.post(
  "/api/gemini/skin-scan",
  async (req, res) => {
    try {
      /*
      |--------------------------------------------------------------------------
      | API KEY
      |--------------------------------------------------------------------------
      */

      if (!ai) {
        return res.status(500).json({
          error:
            "GEMINI_API_KEY environment variable is not configured or is invalid.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | REQUEST
      |--------------------------------------------------------------------------
      */

      const {
        imageBase64,
        mimeType = "image/jpeg",
        notes,
        shopProducts = [],
      } = req.body;

      if (!imageBase64) {
        return res.status(400).json({
          error:
            "Image data is required for skin scan.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | IMAGE
      |--------------------------------------------------------------------------
      */

      const cleanBase64 =
        imageBase64.replace(
          /^data:image\/[^;]+;base64,/,
          ""
        );

      /*
      |--------------------------------------------------------------------------
      | REAL SHOP INVENTORY
      |--------------------------------------------------------------------------
      */

      const safeShopProducts =
        buildSafeShopProducts(
          shopProducts
        );

      const hasShopProducts =
        safeShopProducts.length > 0;

      /*
      |--------------------------------------------------------------------------
      | CATALOG FOR GEMINI
      |--------------------------------------------------------------------------
      |
      | Gemini receives actual product IDs.
      |
      | It may recommend one of these IDs,
      | but the server will ALWAYS validate the ID.
      |--------------------------------------------------------------------------
      */

      const catalogText =
        hasShopProducts
          ? safeShopProducts
              .map(
                (product) =>
                  `PRODUCT ID: ${product.id}
PRODUCT NAME: ${product.name}
CATEGORY: ${product.category}
DESCRIPTION: ${product.description}`
              )
              .join("\n\n")
          : "THE SHOP CURRENTLY HAS NO POSTED PRODUCTS.";

      /*
      |--------------------------------------------------------------------------
      | AI PROMPT
      |--------------------------------------------------------------------------
      */

      const prompt = `
You are Juliet, a careful and friendly beauty-analysis assistant
for Juliet's Makeup Galore in Nairobi, Kenya.

You are analyzing a normal smartphone photograph.

This is a cosmetic beauty-analysis experience.
It is NOT a medical diagnostic system.

Do not diagnose medical conditions.

Do not claim certainty when the photograph does not support certainty.

============================================================
PHOTO QUALITY
============================================================

Accept ordinary smartphone photographs.

Do NOT reject a photograph simply because:

- lighting is imperfect
- the image is slightly grainy
- the face is slightly angled
- the face is not perfectly centered
- some background is visible
- the camera is average
- the skin is dark
- the photograph is not studio quality

Only reject photographs when analysis would genuinely be unreliable.

Examples:

- face mostly outside frame
- no recognizable face
- extreme blur
- skin mostly covered
- extreme filter
- extreme colored lighting

============================================================
SKIN ANALYSIS
============================================================

If usable, assess only visible cosmetic characteristics:

- apparent skin type
- visible hydration appearance
- visible dryness
- visible shine
- visible oiliness
- visible texture
- visible smoothness
- visible complexion evenness
- visible redness
- apparent complexion tone
- apparent undertone
- visible radiance

Do not diagnose:

- acne
- eczema
- rosacea
- infections
- pigmentation disorders
- medical conditions

============================================================
SKIN TYPE
============================================================

Allowed:

"Dry"
"Oily"
"Combination"
"Normal"
"Sensitive"
"Unable to determine"

Use cautious language.

============================================================
UNDERTONE
============================================================

Allowed:

"Warm Golden"
"Cool Rose"
"Neutral Olive"
"Rich Espresso"
"Unable to determine"

Do not force an undertone.

============================================================
COMPONENT SCORES
============================================================

Return five visual scores from 0 to 100:

radianceScore
hydrationAppearanceScore
textureEvennessScore
complexionEvennessScore
oilBalanceScore

Scores must reflect the actual photograph.

Do not use flattering default scores.

Do not make all scores similar.

============================================================
CURRENT SHOP INVENTORY
============================================================

THIS IS THE ONLY SOURCE OF TRUTH FOR SHOP PRODUCTS.

${catalogText}

============================================================
CRITICAL PRODUCT RECOMMENDATION RULES
============================================================

You have TWO jobs:

1. Determine what PRODUCT TYPES would suit the visible characteristics.
2. Where the actual shop catalogue contains a suitable product,
   identify the EXACT PRODUCT ID from the catalogue.

NEVER invent:

- product IDs
- product names
- prices
- products
- availability

If you recommend an actual shop product:

shopProductId MUST be copied EXACTLY from the catalogue above.

If there is no suitable shop product:

shopProductId MUST be null.

Do NOT select a product merely because its name contains words
such as "glow", "beauty", "skin", "care", or "hydrating".

The PRODUCT CATEGORY must make sense.

For example:

A moisturizer recommendation should not be matched to a
foundation simply because the foundation description contains
the word "hydrating".

A sunscreen recommendation should not be matched to a primer.

A cleanser recommendation should not be matched to a serum.

============================================================
RECOMMENDATION QUALITY
============================================================

Recommendations should be based on the visible characteristics.

Examples:

Visible dryness/hydration concern:
- moisturizer
- hydrating serum
- gentle cleanser

Visible oiliness:
- lightweight moisturizer
- mattifying primer
- setting powder

Visible combination characteristics:
- lightweight moisturizer
- balancing serum
- suitable primer

Visible dull appearance:
- hydrating serum
- moisturizer
- highlighter for makeup use

Visible uneven texture:
- gentle skincare preparation
- suitable primer
- lightweight complexion product

Do not over-recommend.

Return no more than 4 recommendations.

Prioritize the most relevant recommendations first.

============================================================
USER NOTES
============================================================

${notes || "No additional user notes."}

============================================================
RETURN JSON
============================================================

{
  "imageQuality": {
    "usable": true,
    "score": 80,
    "issues": [],
    "guidance": ""
  },

  "analysisConfidence": "High",

  "overallSkinType": "Normal",

  "radianceScore": 70,
  "hydrationAppearanceScore": 70,
  "textureEvennessScore": 75,
  "complexionEvennessScore": 75,
  "oilBalanceScore": 70,

  "hydrationLevel": "Balanced",

  "undertone": "Unable to determine",

  "keyObservations": [
    "Visible observation from the photograph"
  ],

  "concernsDetected": [
    "Visible concern"
  ],

  "skincareAdvice": "Concise cosmetic advice.",

  "recommendedProducts": [
    {
      "shopProductId": null,
      "productType": "moisturizer",
      "category": "Moisturizer",
      "reason": "Reason based on visible characteristics."
    }
  ]
}

============================================================
IF PHOTO IS UNUSABLE
============================================================

{
  "imageQuality": {
    "usable": false,
    "score": 20,
    "issues": [
      "Face is too far from the camera"
    ],
    "guidance": "Move closer to the camera and make sure your face fills more of the frame."
  },

  "analysisConfidence": "Low",

  "overallSkinType": "Unable to determine",

  "radianceScore": 0,
  "hydrationAppearanceScore": 0,
  "textureEvennessScore": 0,
  "complexionEvennessScore": 0,
  "oilBalanceScore": 0,

  "hydrationLevel": "Unable to determine",

  "undertone": "Unable to determine",

  "keyObservations": [],

  "concernsDetected": [],

  "skincareAdvice": "Please retake the photo using the guidance above.",

  "recommendedProducts": []
}
`;

      /*
      |--------------------------------------------------------------------------
      | GEMINI REQUEST
      |--------------------------------------------------------------------------
      */

      const response =
        await ai.models.generateContent({
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
            responseMimeType:
              "application/json",

            responseSchema: {
              type: Type.OBJECT,

              properties: {
                imageQuality: {
                  type: Type.OBJECT,

                  properties: {
                    usable: {
                      type: Type.BOOLEAN,
                    },

                    score: {
                      type: Type.INTEGER,
                    },

                    issues: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.STRING,
                      },
                    },

                    guidance: {
                      type: Type.STRING,
                    },
                  },

                  required: [
                    "usable",
                    "score",
                    "issues",
                    "guidance",
                  ],
                },

                analysisConfidence: {
                  type: Type.STRING,
                },

                overallSkinType: {
                  type: Type.STRING,
                },

                radianceScore: {
                  type: Type.INTEGER,
                },

                hydrationAppearanceScore: {
                  type: Type.INTEGER,
                },

                textureEvennessScore: {
                  type: Type.INTEGER,
                },

                complexionEvennessScore: {
                  type: Type.INTEGER,
                },

                oilBalanceScore: {
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
                      shopProductId: {
                        type: Type.STRING,
                        nullable: true,
                      },

                      productType: {
                        type: Type.STRING,
                      },

                      category: {
                        type: Type.STRING,
                      },

                      reason: {
                        type: Type.STRING,
                      },
                    },

                    required: [
                      "shopProductId",
                      "productType",
                      "category",
                      "reason",
                    ],
                  },
                },
              },

              required: [
                "imageQuality",
                "analysisConfidence",
                "overallSkinType",
                "radianceScore",
                "hydrationAppearanceScore",
                "textureEvennessScore",
                "complexionEvennessScore",
                "oilBalanceScore",
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

      /*
      |--------------------------------------------------------------------------
      | PARSE RESPONSE
      |--------------------------------------------------------------------------
      */

      const jsonText =
        response.text || "{}";

      let data: any;

      try {
        data = JSON.parse(jsonText);
      } catch {
        console.error(
          "Gemini returned invalid JSON:",
          jsonText
        );

        return res.status(500).json({
          error:
            "The AI returned an invalid scan result. Please try the photo again.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | PHOTO QUALITY
      |--------------------------------------------------------------------------
      */

      const qualityScore = clamp(
        data.imageQuality?.score
      );

      const usableImage =
        data.imageQuality?.usable === true;

      /*
      |--------------------------------------------------------------------------
      | COMPONENT SCORES
      |--------------------------------------------------------------------------
      */

      const radianceScore = clamp(
        data.radianceScore
      );

      const hydrationAppearanceScore =
        clamp(
          data.hydrationAppearanceScore
        );

      const textureEvennessScore =
        clamp(
          data.textureEvennessScore
        );

      const complexionEvennessScore =
        clamp(
          data.complexionEvennessScore
        );

      const oilBalanceScore = clamp(
        data.oilBalanceScore
      );

      /*
      |--------------------------------------------------------------------------
      | SERVER GLOW SCORE
      |--------------------------------------------------------------------------
      */

      const calculatedGlowScore =
        Math.round(
          radianceScore * 0.25 +
            hydrationAppearanceScore *
              0.20 +
            textureEvennessScore *
              0.20 +
            complexionEvennessScore *
              0.20 +
            oilBalanceScore *
              0.15
        );

      /*
      |--------------------------------------------------------------------------
      | RECOMMENDATIONS
      |--------------------------------------------------------------------------
      */

      const recommendations =
        Array.isArray(
          data.recommendedProducts
        )
          ? data.recommendedProducts.slice(
              0,
              4
            )
          : [];

      /*
      |--------------------------------------------------------------------------
      | VALIDATE GEMINI'S PRODUCT IDs
      |--------------------------------------------------------------------------
      |
      | This is the most important accuracy improvement.
      |
      | Gemini may suggest an ID.
      |
      | We NEVER trust it blindly.
      |
      | We check that the ID actually exists in the
      | current shop inventory.
      |--------------------------------------------------------------------------
      */

      const safeRecommendations =
        recommendations.map(
          (recommendation: any) => {
            const requestedId =
              recommendation.shopProductId
                ? String(
                    recommendation.shopProductId
                  )
                : null;

            let matchedProduct: any =
              null;

            let matchMethod =
              "none";

            let matchScore = 0;

            /*
            |--------------------------------------------------------------------------
            | STEP 1 — EXACT ID VALIDATION
            |--------------------------------------------------------------------------
            */

            if (requestedId) {
              matchedProduct =
                safeShopProducts.find(
                  (product) =>
                    product.id ===
                    requestedId
                );

              if (matchedProduct) {
                /*
                |------------------------------------------------------------------
                | Even when Gemini provides an existing ID,
                | make sure the product category makes sense.
                |------------------------------------------------------------------
                */

                const recommendedCanonical =
                  findCanonicalCategory(
                    recommendation.productType
                  ) ||
                  findCanonicalCategory(
                    recommendation.category
                  );

                const productCanonical =
                  findCanonicalCategory(
                    matchedProduct.category
                  ) ||
                  findCanonicalCategory(
                    matchedProduct.name
                  );

                if (
                  recommendedCanonical &&
                  productCanonical &&
                  recommendedCanonical !==
                    productCanonical
                ) {
                  /*
                  |--------------------------------------------------------------
                  | Gemini chose a real product but it is the wrong category.
                  | Reject it.
                  |--------------------------------------------------------------
                  */

                  matchedProduct =
                    null;
                } else {
                  matchMethod =
                    "verified-id";

                  matchScore = 100;
                }
              }
            }

            /*
            |--------------------------------------------------------------------------
            | STEP 2 — SAFE FALLBACK MATCH
            |--------------------------------------------------------------------------
            |
            | Only used when Gemini did not provide a valid product ID.
            |--------------------------------------------------------------------------
            */

            if (
              !matchedProduct &&
              safeShopProducts.length > 0
            ) {
              const fallback =
                findBestProductMatch(
                  recommendation,
                  safeShopProducts
                );

              if (fallback.product) {
                matchedProduct =
                  fallback.product;

                matchScore =
                  fallback.score;

                matchMethod =
                  "verified-category-match";
              }
            }

            /*
            |--------------------------------------------------------------------------
            | AVAILABLE
            |--------------------------------------------------------------------------
            */

            const available =
              matchedProduct !== null;

            /*
            |--------------------------------------------------------------------------
            | FINAL SAFE PRODUCT
            |--------------------------------------------------------------------------
            */

            return {
              id: available
                ? matchedProduct.id
                : "",

              name: available
                ? matchedProduct.name
                : recommendation.productType ||
                  recommendation.category ||
                  "Recommended beauty product",

              reason:
                recommendation.reason ||
                "This product may suit the visible characteristics.",

              productType:
                recommendation.productType ||
                "",

              category:
                recommendation.category ||
                "",

              availableInShop:
                available,

              availabilityLabel:
                available
                  ? "Available in shop"
                  : "Not available in shop",

              shopProductId:
                available
                  ? matchedProduct.id
                  : null,

              shopProductName:
                available
                  ? matchedProduct.name
                  : null,

              /*
              |----------------------------------------------------------------
              | DEBUG/TRANSPARENCY INFORMATION
              |----------------------------------------------------------------
              |
              | This is useful while we are testing the app.
              |----------------------------------------------------------------
              */

              matchMethod,

              matchScore,
            };
          }
        );

      /*
      |--------------------------------------------------------------------------
      | REMOVE DUPLICATE SHOP PRODUCTS
      |--------------------------------------------------------------------------
      |
      | Prevent the AI from recommending the same product twice.
      |--------------------------------------------------------------------------
      */

      const seenProductIds =
        new Set<string>();

      const uniqueRecommendations =
        safeRecommendations.filter(
          (recommendation: any) => {
            if (
              !recommendation.shopProductId
            ) {
              return true;
            }

            if (
              seenProductIds.has(
                recommendation.shopProductId
              )
            ) {
              return false;
            }

            seenProductIds.add(
              recommendation.shopProductId
            );

            return true;
          }
        );

      /*
      |--------------------------------------------------------------------------
      | FINAL RESULT
      |--------------------------------------------------------------------------
      */

      const finalResult = {
        imageQuality: {
          usable: usableImage,

          score: qualityScore,

          issues:
            Array.isArray(
              data.imageQuality?.issues
            )
              ? data.imageQuality.issues
              : [],

          guidance:
            data.imageQuality?.guidance ||
            "Use bright, even light, face the camera and move slightly closer.",
        },

        analysisConfidence:
          usableImage
            ? data.analysisConfidence ||
              "Moderate"
            : "Low",

        overallSkinType:
          usableImage
            ? data.overallSkinType ||
              "Unable to determine"
            : "Unable to determine",

        hydrationLevel:
          usableImage
            ? data.hydrationLevel ||
              "Unable to determine"
            : "Unable to determine",

        undertone:
          usableImage
            ? data.undertone ||
              "Unable to determine"
            : "Unable to determine",

        radianceScore:
          usableImage
            ? radianceScore
            : 0,

        hydrationAppearanceScore:
          usableImage
            ? hydrationAppearanceScore
            : 0,

        textureEvennessScore:
          usableImage
            ? textureEvennessScore
            : 0,

        complexionEvennessScore:
          usableImage
            ? complexionEvennessScore
            : 0,

        oilBalanceScore:
          usableImage
            ? oilBalanceScore
            : 0,

        glowScore:
          usableImage
            ? calculatedGlowScore
            : 0,

        keyObservations:
          usableImage &&
          Array.isArray(
            data.keyObservations
          )
            ? data.keyObservations
            : [],

        concernsDetected:
          usableImage &&
          Array.isArray(
            data.concernsDetected
          )
            ? data.concernsDetected
            : [],

        skincareAdvice:
          usableImage
            ? data.skincareAdvice ||
              "Try a simple skincare routine suited to your visible skin characteristics."
            : "Please retake the photo using the guidance above.",

        recommendedProducts:
          usableImage
            ? uniqueRecommendations
            : [],
      };

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.json(
        finalResult
      );
    } catch (err: any) {
      console.error(
        "Juliet AI Skin Scan Error:",
        err
      );

      return res.status(500).json({
        error:
          err?.message ||
          "Skin scan analysis failed. Please try again.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| JULIET BEAUTY CHAT
|--------------------------------------------------------------------------
*/

app.post(
  "/api/gemini/chat",
  async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error:
            "GEMINI_API_KEY environment variable is not configured or is invalid.",
        });
      }

      const {
        history = [],
        message,
      } = req.body;

      if (!message) {
        return res.status(400).json({
          error:
            "Message is required.",
        });
      }

      const systemInstruction = `
You are Juliet, the warm, stylish and knowledgeable beauty assistant
and founder of Juliet's Makeup Galore in Nairobi, Kenya.

Help customers with:

- skincare preparation
- makeup techniques
- product selection
- beauty routines
- shade guidance
- store products
- artist services

IMPORTANT:

Do not invent products.

Do not invent prices.

If the customer asks about a shop product and you do not have
reliable information that it is currently available, say that
you cannot confirm its availability.

Keep answers warm, conversational and concise.

Use clean line breaks and occasional beauty emojis.

ARTIST SERVICES:

- Bridal Glam & Touchup — KSh 8,500
- Evening & Red Carpet Glam — KSh 5,000
- Editorial & Studio Photoshoot — KSh 6,500
- 1-on-1 Personal Beauty Masterclass — KSh 4,000
`;

      const contents = [
        ...history.map(
          (h: any) => ({
            role:
              h.role === "assistant"
                ? "model"
                : "user",

            parts: [
              {
                text:
                  h.text ||
                  h.message ||
                  "",
              },
            ],
          })
        ),

        {
          role: "user",

          parts: [
            {
              text: message,
            },
          ],
        },
      ];

      const response =
        await ai.models.generateContent({
          model:
            "gemini-3.6-flash",

          contents,

          config: {
            systemInstruction,
          },
        });

      const reply =
        response.text ||
        "I'm so glad you asked! How else can I help you sparkle today? ♡";

      return res.json({
        reply,
      });
    } catch (err: any) {
      console.error(
        "Juliet Chat Error:",
        err
      );

      return res.status(500).json({
        error:
          err?.message ||
          "Failed to process chat.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

async function startServer() {
  if (
    process.env.NODE_ENV !==
    "production"
  ) {
    const vite =
      await createViteServer({
        server: {
          middlewareMode: true,
        },

        appType: "spa",
      });

    app.use(
      vite.middlewares
    );
  } else {
    const distPath =
      path.join(
        process.cwd(),
        "dist"
      );

    app.use(
      express.static(
        distPath
      )
    );

    app.get(
      "*",
      (req, res) => {
        res.sendFile(
          path.join(
            distPath,
            "index.html"
          )
        );
      }
    );
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