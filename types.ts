export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  date: string;
  content: string;
  source: 'App Store' | 'Play Store' | 'G2' | 'Capterra' | 'Twitter';
}

export interface PainPoint {
  category: string;
  count: number;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface FeatureGap {
  featureName: string;
  demandLevel: 'Critical' | 'Nice to Have';
  context: string;
}

export interface CompetitorAnalysis {
  id: string;
  competitorName: string;
  competitorUrl?: string;
  dateAnalyzed: string;
  totalReviewsAnalyzed: number;
  averageRating: number;
  sentimentSummary: string;
  painPoints: PainPoint[];
  featureGaps: FeatureGap[];
  reviews: Review[];
  blueprint?: ProductBlueprint;
}

export interface ProductBlueprint {
  productName: string;
  tagline: string;
  valueProposition: string;
  coreFeatures: {
    title: string;
    description: string;
    solvesGap: string;
  }[];
  marketingAngles: string[];
}

export enum AppState {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  ANALYZER_INPUT = 'ANALYZER_INPUT',
  ANALYZING = 'ANALYZING',
  INSIGHTS = 'INSIGHTS',
  BLUEPRINT = 'BLUEPRINT',
  SETTINGS = 'SETTINGS',
}