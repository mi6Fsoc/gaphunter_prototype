import { GoogleGenAI, Type } from "@google/genai";
import { CompetitorAnalysis, Review, PainPoint, FeatureGap, ProductBlueprint } from "../types";

// Ensure API Key is available
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Simulates scraping by asking Gemini to recall or hallucinate plausible reviews based on the competitor description.
 * In a real app, this would be replaced by a backend scraper.
 */
export const fetchMockReviews = async (competitorName: string, description: string): Promise<Review[]> => {
  if (!apiKey) throw new Error("API Key is missing");

  const model = "gemini-2.5-flash";
  const prompt = `
    Act as a data scraper. Generate 20 realistic, raw, negative user reviews for a SaaS product named "${competitorName}".
    The product is described as: "${description}".
    Focus on common SaaS complaints: high pricing, poor support, buggy UI, missing specific features, complexity, data lock-in.
    Vary the length and tone. Ratings should be mostly 1, 2, or 3 stars.
    Return JSON only.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              author: { type: Type.STRING },
              rating: { type: Type.INTEGER },
              date: { type: Type.STRING },
              content: { type: Type.STRING },
              source: { type: Type.STRING, enum: ['App Store', 'Play Store', 'G2', 'Capterra', 'Twitter'] }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Review[];
  } catch (error) {
    console.error("Error generating mock reviews:", error);
    return [];
  }
};

/**
 * Analyzes the raw reviews to extract structured insights.
 */
export const analyzeCompetitorReviews = async (competitorName: string, reviews: Review[]): Promise<Partial<CompetitorAnalysis>> => {
  if (!apiKey) throw new Error("API Key is missing");

  const model = "gemini-2.5-flash";
  const reviewsText = reviews.map(r => `[${r.rating} stars] ${r.content}`).join("\n\n");

  const prompt = `
    Analyze the following ${reviews.length} reviews for competitor "${competitorName}".
    Identify the top recurring pain points and missing features that users are complaining about.
    Summarize the overall sentiment.
    
    Reviews:
    ${reviewsText}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentimentSummary: { type: Type.STRING },
            averageRating: { type: Type.NUMBER },
            painPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  count: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
                }
              }
            },
            featureGaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  featureName: { type: Type.STRING },
                  demandLevel: { type: Type.STRING, enum: ['Critical', 'Nice to Have'] },
                  context: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis generated");
    return JSON.parse(text) as Partial<CompetitorAnalysis>;
  } catch (error) {
    console.error("Error analyzing reviews:", error);
    throw error;
  }
};

/**
 * Generates a product blueprint based on the identified gaps.
 */
export const generateProductBlueprint = async (analysis: CompetitorAnalysis): Promise<ProductBlueprint> => {
    if (!apiKey) throw new Error("API Key is missing");

    const model = "gemini-2.5-flash";
    const context = JSON.stringify({
        competitor: analysis.competitorName,
        painPoints: analysis.painPoints,
        gaps: analysis.featureGaps
    });

    const prompt = `
      Based on the provided competitor analysis (Pain Points and Feature Gaps), create a Product Blueprint for a new SaaS that kills this competitor.
      The product should directly address the high severity pain points and include the missing features.
      
      Context: ${context}
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        productName: { type: Type.STRING },
                        tagline: { type: Type.STRING },
                        valueProposition: { type: Type.STRING },
                        coreFeatures: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    solvesGap: { type: Type.STRING }
                                }
                            }
                        },
                        marketingAngles: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No blueprint generated");
        return JSON.parse(text) as ProductBlueprint;

    } catch (error) {
        console.error("Error generating blueprint:", error);
        throw error;
    }
}