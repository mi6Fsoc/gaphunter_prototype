import { CompetitorAnalysis, Review, ProductBlueprint } from '../types';

/**
 * Calls backend server endpoint to generate realistic competitor reviews.
 * Gemini API calls are securely executed server-side.
 */
export const fetchMockReviews = async (competitorName: string, description: string): Promise<Review[]> => {
  const response = await fetch('/api/reviews/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ competitorName, description }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch reviews (HTTP ${response.status})`);
  }

  const data = await response.json();
  return data.reviews || [];
};

/**
 * Analyzes the competitor reviews using server-side Gemini intelligence.
 */
export const analyzeCompetitorReviews = async (
  competitorName: string,
  reviews: Review[]
): Promise<Partial<CompetitorAnalysis>> => {
  const response = await fetch('/api/reviews/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ competitorName, reviews }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to analyze reviews (HTTP ${response.status})`);
  }

  const data = await response.json();
  return data;
};

/**
 * Generates an actionable SaaS product blueprint from competitor gaps via server-side Gemini.
 */
export const generateProductBlueprint = async (analysis: CompetitorAnalysis): Promise<ProductBlueprint> => {
  const response = await fetch('/api/blueprint/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysis }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to generate blueprint (HTTP ${response.status})`);
  }

  const data = await response.json();
  return data;
};