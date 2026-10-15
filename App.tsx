import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Card, Button, Badge, LoadingSpinner } from './components/UIComponents';
import { PainPointChart, RatingBreakdownBar } from './components/Charts';
import { AppState, CompetitorAnalysis, ProductBlueprint, Review } from './types';
import { fetchMockReviews, analyzeCompetitorReviews, generateProductBlueprint } from './services/geminiService';
import { 
  ArrowRight, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  BarChart3, 
  MessageSquare,
  Zap,
  TrendingDown,
  Target,
  PlayCircle,
  Users,
  ShieldCheck,
  Rocket,
  ChevronDown,
  Plus,
  Minus,
  Check,
  X,
  ChevronRight,
  Menu,
  Quote,
  Copy,
  ExternalLink,
  Flame,
  Radio,
  Layers,
  ArrowUpRight,
  Filter,
  Download
} from 'lucide-react';
import { GapHunterLogo } from './components/Logo';

const PRESET_COMPETITORS = [
  { name: 'Spotify', desc: 'Subscription-based music streaming service with 600M+ users' },
  { name: 'Salesforce', desc: 'Enterprise CRM and customer operations platform' },
  { name: 'Notion', desc: 'All-in-one productivity workspace, docs, and project management' },
  { name: 'Jira', desc: 'Issue and agile project tracking software for engineering teams' },
  { name: 'Slack', desc: 'Enterprise team communication and channel messaging' },
];

const INITIAL_ANALYSIS: CompetitorAnalysis = {
  id: 'demo-spotify',
  competitorName: 'Spotify',
  competitorUrl: 'https://spotify.com',
  totalReviewsAnalyzed: 48,
  averageRating: 2.3,
  dateAnalyzed: new Date().toLocaleDateString(),
  sentimentSummary: "Long-time paid subscribers are furious about recurrent price bumps, aggressive ad injections for podcasts, and algorithm changes that favor sponsored tracks over personal music curation. Severe demand exists for a lean, lightning-fast native player.",
  painPoints: [
    { category: 'Pricing & Tiers', count: 24, description: 'Repeated unannounced subscription increases and forced audiobook bundling', severity: 'High' },
    { category: 'UI Bloat & Navigation', count: 19, description: 'TikTok-style video feeds, cluttering of basic library controls and offline tabs', severity: 'High' },
    { category: 'Shuffle & Discovery', count: 14, description: 'Smart Shuffle forces sponsored tracks and repeats the same 30 songs relentlessly', severity: 'Medium' },
    { category: 'Desktop Performance', count: 11, description: 'High RAM usage, cache freezing, and intermittent offline sync crashes', severity: 'Medium' },
    { category: 'Customer Support', count: 6, description: 'Automated chatbots unable to resolve refund requests or account transfer issues', severity: 'Low' },
  ],
  featureGaps: [
    { featureName: 'True Hi-Fi Lossless Audio', demandLevel: 'Critical', context: 'Promised for years while competitors (Apple Music, Tidal) include it at no extra charge.' },
    { featureName: '1-Click Library & Playlist Exporter', demandLevel: 'Critical', context: 'Users feel trapped by proprietary playlist data and want open CSV/JSON portability.' },
    { featureName: 'Distraction-Free Zen Mode', demandLevel: 'Critical', context: 'Option to hide all podcasts, video clips, and algorithmic banners to just play music.' },
    { featureName: 'Granular Local Cache Control', demandLevel: 'Nice to Have', context: 'Allow users to lock offline tracks without repeated background re-indexing.' },
  ],
  reviews: [
    {
      id: 'rev-1',
      author: 'Marcus Chen',
      rating: 2,
      date: '3 days ago',
      content: 'Another price hike this morning. I have paid for Spotify Premium for 8 years, but now they force feed audiobooks and clutter my home screen with video loops. I just want to listen to my saved albums quickly.',
      source: 'App Store'
    },
    {
      id: 'rev-2',
      author: 'Sarah Jenkins',
      rating: 1,
      date: '1 week ago',
      content: 'Smart shuffle is completely broken. It keeps injecting sponsored top-40 pop into my ambient study playlists. When you turn it off, it silently re-enables itself after 2 hours. Ridiculous.',
      source: 'Twitter'
    },
    {
      id: 'rev-3',
      author: 'David L.',
      rating: 2,
      date: '2 weeks ago',
      content: 'The desktop app takes 4GB of RAM on macOS and freezes when waking from sleep mode. Why is a music player heavier than Photoshop? Please give us a lightweight native alternative.',
      source: 'G2'
    },
    {
      id: 'rev-4',
      author: 'Elena Rostova',
      rating: 3,
      date: '3 weeks ago',
      content: 'Decent library size, but trying to export your own curated playlists is impossible without sketchy third-party web scrapers. We need open data export.',
      source: 'Capterra'
    },
    {
      id: 'rev-5',
      author: 'Alex Thorne',
      rating: 1,
      date: '1 month ago',
      content: 'Still no Lossless audio in 2026 after four years of press releases. Meanwhile Apple Music and Tidal have 24-bit 192kHz at $10.99. Cancelling my family plan.',
      source: 'Play Store'
    }
  ]
};

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [competitorName, setCompetitorName] = useState('');
  const [competitorDesc, setCompetitorDesc] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [blueprint, setBlueprint] = useState<ProductBlueprint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [copiedBlueprint, setCopiedBlueprint] = useState(false);
  const [activeReviewFilter, setActiveReviewFilter] = useState<'all' | 'App Store' | 'Play Store' | 'G2' | 'Capterra' | 'Twitter'>('all');

  // Landing Page State
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleStartAnalysis = async (presetName?: string, presetDesc?: string) => {
    const targetName = presetName || competitorName;
    const targetDesc = presetDesc || competitorDesc;
    if (!targetName || !targetDesc) return;
    
    setCompetitorName(targetName);
    setCompetitorDesc(targetDesc);
    setIsAnalyzing(true);
    setAppState(AppState.ANALYZING);
    setError(null);
    setAnalysisStep('Harvesting public reviews & sentiment across stores...');

    try {
      const reviews = await fetchMockReviews(targetName, targetDesc);
      
      setAnalysisStep(`Analyzing ${reviews.length} user complaints with Gemini intelligence...`);
      const analysisData = await analyzeCompetitorReviews(targetName, reviews);
      
      const fullAnalysis: CompetitorAnalysis = {
        id: Date.now().toString(),
        competitorName: targetName,
        competitorUrl: '',
        dateAnalyzed: new Date().toLocaleDateString(),
        totalReviewsAnalyzed: reviews.length,
        averageRating: analysisData.averageRating || 2.1,
        sentimentSummary: analysisData.sentimentSummary || '',
        painPoints: analysisData.painPoints || [],
        featureGaps: analysisData.featureGaps || [],
        reviews: reviews,
      };

      setCurrentAnalysis(fullAnalysis);
      setAppState(AppState.INSIGHTS);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Analysis failed. Please try again.');
      setAppState(AppState.ANALYZER_INPUT);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateBlueprint = async () => {
    if (!currentAnalysis) return;
    setIsAnalyzing(true);
    setAppState(AppState.ANALYZING);
    setAnalysisStep('Synthesizing Product Blueprint & Competitive Positioning...');

    try {
      const generatedBlueprint = await generateProductBlueprint(currentAnalysis);
      setBlueprint(generatedBlueprint);
      setCurrentAnalysis({ ...currentAnalysis, blueprint: generatedBlueprint });
      setAppState(AppState.BLUEPRINT);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate blueprint.');
      setAppState(AppState.INSIGHTS);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyBlueprintText = () => {
    if (!blueprint) return;
    const text = `# ${blueprint.productName}
**Tagline:** ${blueprint.tagline}
**Value Proposition:** ${blueprint.valueProposition}

## Core Features
${blueprint.coreFeatures.map(f => `- **${f.title}**: ${f.description} (Solves: ${f.solvesGap})`).join('\n')}

## Marketing Angles
${blueprint.marketingAngles.map(m => `- ${m}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopiedBlueprint(true);
    setTimeout(() => setCopiedBlueprint(false), 2000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  /* =========================================================================
     LANDING PAGE (Lumina Inspired)
     ========================================================================= */
  const renderLandingPage = () => (
    <div className="min-h-screen bg-lumina-dark text-white font-sans selection:bg-lumina-orange selection:text-white overflow-x-hidden">
      
      {/* Top Banner */}
      <div className="bg-[#18181A] border-b border-lumina-border text-center py-2.5 px-4 text-xs font-mono text-zinc-300">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-lumina-orange animate-pulse"></span>
          <span className="text-zinc-200">LUMINA ARCHITECTURE</span>
          <span className="text-zinc-500">·</span>
          <span className="text-lumina-orange font-semibold">Gemini 3.8 Live Intelligence Active</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-lumina-dark/85 backdrop-blur-md border-b border-lumina-border px-6 sm:px-12">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setAppState(AppState.LANDING)}
          >
            <GapHunterLogo className="w-8 h-8" showText={true} />
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Live Radar</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => {
                setCurrentAnalysis(INITIAL_ANALYSIS);
                setAppState(AppState.INSIGHTS);
              }}
              className="text-xs font-mono font-medium px-4 py-2.5 rounded-lg border border-lumina-border text-zinc-300 hover:text-white hover:border-zinc-500 transition-all"
            >
              Demo Preview
            </button>
            <Button 
              size="md"
              onClick={() => setAppState(AppState.ANALYZER_INPUT)}
              className="group"
            >
              <span>Start Hunting</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>

          <button 
            className="md:hidden p-2 rounded-lg border border-lumina-border text-zinc-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-lumina-border flex flex-col gap-3">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm text-zinc-300">Features</a>
            <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm text-zinc-300">Live Radar</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm text-zinc-300">Pricing</a>
            <Button 
              onClick={() => {
                setMobileMenuOpen(false);
                setAppState(AppState.ANALYZER_INPUT);
              }}
              className="w-full mt-2"
            >
              Start Hunting
            </Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 sm:px-12 pt-20 pb-24 md:pt-28 md:pb-36 overflow-hidden">
        {/* Luminous vermillion backdrop glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-lumina-orange/12 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lumina-orange/10 border border-lumina-orange/25 text-xs font-mono font-medium text-lumina-orange mb-8">
            <Flame className="w-3.5 h-3.5" />
            <span>DESIGNING CLARITY IN SAAS MARKET GAPS</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tight text-white mb-8 leading-[1.04]">
            Find the flaws.<br />
            <span className="text-lumina-orange">Build the future.</span>
          </h1>

          <p className="text-lg sm:text-xl text-lumina-muted max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Competitor negative reviews are unfiltered product roadmaps. GapHunter extracts recurring user frustration and writes the blueprint for your next winning SaaS.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              size="lg"
              onClick={() => setAppState(AppState.ANALYZER_INPUT)}
              className="w-full sm:w-auto"
            >
              <span>Scan Competitor Reviews</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <button
              onClick={() => {
                setCurrentAnalysis(INITIAL_ANALYSIS);
                setAppState(AppState.INSIGHTS);
              }}
              className="w-full sm:w-auto px-7 py-3.5 text-base font-medium rounded-lg bg-lumina-surface border border-lumina-border text-white hover:border-zinc-500 hover:bg-[#222226] transition-all"
            >
              Explore Spotify Demo
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-lumina-border/60">
            <span className="text-xs font-mono text-zinc-500 mr-2">Try Preset:</span>
            {PRESET_COMPETITORS.slice(0, 4).map((p) => (
              <button
                key={p.name}
                onClick={() => handleStartAnalysis(p.name, p.desc)}
                className="text-xs font-mono px-3 py-1.5 rounded-lg bg-lumina-surface border border-lumina-border text-zinc-300 hover:text-white hover:border-lumina-orange transition-all"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Feature Section (Lumina Signature) */}
      <section id="features" className="px-6 sm:px-12 py-24 border-t border-lumina-border bg-lumina-dark relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-semibold text-lumina-orange tracking-widest uppercase mb-3 block">
              Precision Intelligence
            </span>
            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-white mb-4">
              Designed for Clarity
            </h2>
            <p className="text-lumina-muted text-base leading-relaxed">
              Every data point maps to verified customer churn triggers. Stop guessing what users want when they already wrote it on G2 and App Store.
            </p>
          </div>

          {/* Bento Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Bento Card 1: Review Scraper Engine (Span 2) */}
            <div className="md:col-span-2 bg-lumina-surface border border-lumina-border rounded-lg p-8 relative overflow-hidden group hover:border-lumina-orange/40 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-lumina-orange/15 border border-lumina-orange/30 flex items-center justify-center text-lumina-orange">
                    <Radio className="w-4 h-4" />
                  </span>
                  <h3 className="text-xl font-medium text-white">Continuous Sentiment Ingestion</h3>
                </div>
                <span className="text-xs font-mono text-zinc-400">G2 · App Store · Play Store · X</span>
              </div>
              <p className="text-zinc-400 text-sm mb-6 max-w-xl leading-relaxed">
                Aggregates 1, 2, and 3-star reviews across all major app stores and platforms. Strips corporate PR and extracts the raw emotional grievances paying customers have right now.
              </p>

              {/* Interactive simulated stream */}
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 rounded-lg bg-[#141416] border border-[#26262B] flex items-center justify-between">
                  <span className="text-zinc-300">"Hidden price hike after renewal..."</span>
                  <span className="text-red-400 font-semibold">1★ · G2</span>
                </div>
                <div className="p-3.5 rounded-lg bg-[#141416] border border-[#26262B] flex items-center justify-between">
                  <span className="text-zinc-300">"Desktop client consumes 3.8GB RAM..."</span>
                  <span className="text-amber-400 font-semibold">2★ · App Store</span>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Rating Erosion */}
            <div className="bg-lumina-surface border border-lumina-border rounded-lg p-8 flex flex-col justify-between group hover:border-lumina-orange/40 transition-all">
              <div>
                <span className="w-8 h-8 rounded-lg bg-lumina-orange/15 border border-lumina-orange/30 flex items-center justify-center text-lumina-orange mb-6">
                  <TrendingDown className="w-4 h-4" />
                </span>
                <h3 className="text-xl font-medium text-white mb-2">Churn Probability</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Calculates vulnerability index and likelihood of users jumping to an agile indie alternative.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#141416] border border-[#26262B]">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-extrabold text-lumina-orange">84%</span>
                  <span className="text-xs font-mono text-zinc-400 uppercase">Opportunity Score</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-lumina-orange w-[84%] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Bento Card 3: Categorized Pain Points */}
            <div className="bg-lumina-surface border border-lumina-border rounded-lg p-8 flex flex-col justify-between group hover:border-lumina-orange/40 transition-all">
              <div>
                <span className="w-8 h-8 rounded-lg bg-lumina-orange/15 border border-lumina-orange/30 flex items-center justify-center text-lumina-orange mb-6">
                  <BarChart3 className="w-4 h-4" />
                </span>
                <h3 className="text-xl font-medium text-white mb-2">Categorized Friction</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  Groups thousands of disjointed comments into actionable thematic pillars.
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-[#141416]">
                  <span className="text-zinc-300">Pricing & Tiers</span>
                  <span className="text-lumina-orange font-bold">45%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#141416]">
                  <span className="text-zinc-300">UX / Clutter</span>
                  <span className="text-zinc-400">32%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#141416]">
                  <span className="text-zinc-300">Performance</span>
                  <span className="text-zinc-400">18%</span>
                </div>
              </div>
            </div>

            {/* Bento Card 4: Blueprint Architect (Span 2) */}
            <div className="md:col-span-2 bg-gradient-to-br from-[#1A1A1A] to-[#221814] border border-lumina-border rounded-lg p-8 relative overflow-hidden group hover:border-lumina-orange/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-lumina-orange text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-lumina-orange/20 text-lumina-orange font-semibold">
                  GENERATIVE BLUEPRINTS
                </span>
              </div>
              <h3 className="text-2xl font-medium text-white mb-3">
                Autonomous SaaS Venture Architecture
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-xl">
                Takes the discovered gaps and immediately drafts a high-converting value proposition, 4 targeted antidote features, and competitive landing page messaging ready for validation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-lumina-orange font-mono font-semibold block mb-1">01. Name & Positioning</span>
                  <span className="text-zinc-300">Sharp, memorable brand targeting competitor bloat.</span>
                </div>
                <div className="p-3.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-lumina-orange font-mono font-semibold block mb-1">02. Antidote Features</span>
                  <span className="text-zinc-300">Directly implements what users are begging for.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Live Interactive Demo Section */}
      <section id="demo" className="px-6 sm:px-12 py-24 border-t border-lumina-border bg-[#111113]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-mono font-semibold text-lumina-orange uppercase tracking-wider block mb-2">
                Live Radar
              </span>
              <h2 className="text-3xl sm:text-4xl font-medium text-white tracking-tight">
                Inspect a real analysis in 1-click
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-md mt-3 md:mt-0">
              Select any tech titan below to see how GapHunter immediately pinpoints where their customers are hurting.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {PRESET_COMPETITORS.map((p) => (
              <button
                key={p.name}
                onClick={() => handleStartAnalysis(p.name, p.desc)}
                className="p-4 rounded-lg bg-lumina-surface border border-lumina-border hover:border-lumina-orange hover:bg-lumina-surfaceHover text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white group-hover:text-lumina-orange transition-colors">
                    {p.name}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[11px] text-zinc-400 line-clamp-1">
                  {p.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Interactive Demo Card */}
          <div className="bg-lumina-surface border border-lumina-border rounded-lg p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-lumina-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-lumina-orange/15 border border-lumina-orange/30 flex items-center justify-center font-bold text-lumina-orange font-mono">
                  SP
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Spotify (Market Intelligence)</h4>
                  <p className="text-xs text-zinc-400 font-mono">48 verified reviews analyzed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCurrentAnalysis(INITIAL_ANALYSIS);
                    setAppState(AppState.INSIGHTS);
                  }}
                >
                  Open Full Studio
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setCurrentAnalysis(INITIAL_ANALYSIS);
                    handleGenerateBlueprint();
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Blueprint
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              <div>
                <h5 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                  Top Vulnerability Spectrum
                </h5>
                <PainPointChart data={INITIAL_ANALYSIS.painPoints} />
              </div>

              <div>
                <h5 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                  Unserved Customer Demands
                </h5>
                <div className="space-y-3">
                  {INITIAL_ANALYSIS.featureGaps.slice(0, 3).map((g, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg bg-[#141416] border border-[#26262B]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-white">{g.featureName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-lumina-orange/15 text-lumina-orange font-semibold">
                          {g.demandLevel}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{g.context}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Lumina Contrast) */}
      <section id="pricing" className="px-6 sm:px-12 py-24 border-t border-lumina-border bg-lumina-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-mono font-semibold text-lumina-orange uppercase tracking-wider block mb-3">
              Simple Investment
            </span>
            <h2 className="text-4xl font-medium tracking-tight text-white mb-4">
              Priced for Founders & Studios
            </h2>
            <p className="text-lumina-muted text-sm leading-relaxed mb-8">
              One validated market gap saves you 6 months of building something nobody wants.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center p-1 rounded-lg bg-lumina-surface border border-lumina-border">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                  billingCycle === 'monthly' ? 'bg-lumina-orange text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly' ? 'bg-lumina-orange text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Annual</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold">20% OFF</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tier 1: Starter */}
            <div className="bg-lumina-surface border border-lumina-border rounded-lg p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-zinc-400 uppercase font-semibold">Indie Starter</span>
                <div className="flex items-baseline gap-1 mt-4 mb-2">
                  <span className="text-4xl font-bold text-white">
                    {billingCycle === 'monthly' ? '$29' : '$23'}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">/month</span>
                </div>
                <p className="text-xs text-zinc-400 mb-6">For solo founders testing their first 3 SaaS hypotheses.</p>

                <div className="space-y-3 pt-6 border-t border-lumina-border text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-lumina-orange" />
                    <span>5 Competitor Scans / month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-lumina-orange" />
                    <span>Public Review Scraper (App Stores & G2)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-lumina-orange" />
                    <span>Instant SaaS Blueprint Generation</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setAppState(AppState.ANALYZER_INPUT)}
                className="w-full mt-8 py-2.5 rounded-lg border border-lumina-border hover:border-zinc-400 text-sm font-medium text-white transition-all"
              >
                Choose Starter
              </button>
            </div>

            {/* Tier 2: Pro (Featured with Lumina Orange Accent) */}
            <div className="bg-[#201815] border-2 border-lumina-orange rounded-lg p-8 flex flex-col justify-between relative shadow-[0_8px_40px_rgba(232,93,34,0.15)]">
              <div className="absolute -top-3 right-6 bg-lumina-orange text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-mono text-lumina-orange uppercase font-semibold">Venture Pro</span>
                <div className="flex items-baseline gap-1 mt-4 mb-2">
                  <span className="text-4xl font-bold text-white">
                    {billingCycle === 'monthly' ? '$79' : '$63'}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">/month</span>
                </div>
                <p className="text-xs text-zinc-300 mb-6">For product managers and serial builders seeking serious leverage.</p>

                <div className="space-y-3 pt-6 border-t border-lumina-orange/20 text-xs text-zinc-200">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-lumina-orange" />
                    <span className="font-semibold">Unlimited Competitor Scans</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-lumina-orange" />
                    <span>Gemini 3.8 Deep Sentiment Model</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-lumina-orange" />
                    <span>Export Markdown & PDF Pitch Blueprints</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-lumina-orange" />
                    <span>Competitive Anti-Ad Messaging Copy</span>
                  </div>
                </div>
              </div>

              <Button
                size="md"
                onClick={() => setAppState(AppState.ANALYZER_INPUT)}
                className="w-full mt-8"
              >
                Start Pro Trial
              </Button>
            </div>

            {/* Tier 3: Studio */}
            <div className="bg-lumina-surface border border-lumina-border rounded-lg p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-zinc-400 uppercase font-semibold">Venture Studio</span>
                <div className="flex items-baseline gap-1 mt-4 mb-2">
                  <span className="text-4xl font-bold text-white">
                    {billingCycle === 'monthly' ? '$199' : '$159'}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">/month</span>
                </div>
                <p className="text-xs text-zinc-400 mb-6">For agencies, incubators, and product studios managing portfolios.</p>

                <div className="space-y-3 pt-6 border-t border-lumina-border text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-lumina-orange" />
                    <span>Multi-seat Team Collaboration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-lumina-orange" />
                    <span>Continuous Competitor Vulnerability Alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-lumina-orange" />
                    <span>Dedicated Venture Architect Support</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setAppState(AppState.ANALYZER_INPUT)}
                className="w-full mt-8 py-2.5 rounded-lg border border-lumina-border hover:border-zinc-400 text-sm font-medium text-white transition-all"
              >
                Contact Studio
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="px-6 sm:px-12 py-24 border-t border-lumina-border bg-lumina-surfaceSubtle">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono font-semibold text-lumina-orange uppercase tracking-wider block mb-3">
              Clarity & Answers
            </span>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Where does GapHunter get competitor review data?",
                a: "We synthesize public reviews and feedback from verified platforms including G2, Capterra, the Apple App Store, Google Play Store, and direct discussions on X/Twitter. Our Gemini engine extracts real customer complaints and recurring pain points."
              },
              {
                q: "How does the Product Blueprint work?",
                a: "Instead of giving you raw charts, GapHunter acts as a SaaS Venture Architect. It analyzes what users hate about the incumbent and writes the antidote: a punchy product name, sharp tagline, 4 core killer features that solve those exact gaps, and aggressive positioning angles."
              },
              {
                q: "Can I analyze non-tech or niche B2B tools?",
                a: "Yes! GapHunter excels at discovering unserved gaps across any industry, from enterprise CRM and marketing platforms to micro-SaaS developer tools and mobile consumer utilities."
              },
              {
                q: "How accurate is the opportunity score?",
                a: "The score is calculated based on review volume, complaint severity, frequency of high-friction keywords (e.g. 'unjustified pricing', 'clunky UI', 'support ignored me'), and the absence of native export alternatives."
              }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-lumina-border rounded-lg bg-lumina-surface overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between text-sm font-medium text-white hover:text-lumina-orange transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${openFaq === idx ? 'rotate-180 text-lumina-orange' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-sm text-zinc-400 leading-relaxed border-t border-lumina-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 sm:px-12 py-12 border-t border-lumina-border bg-lumina-dark text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <GapHunterLogo className="w-5 h-5" />
            <span className="font-sans font-semibold text-white">GapHunter</span>
            <span className="text-zinc-600">·</span>
            <span>Lumina Clarity Edition</span>
          </div>
          <div>
            Built with modern Gemini 3.8 Flash intelligence · All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );

  /* =========================================================================
     ANALYZER INPUT VIEW
     ========================================================================= */
  const renderAnalyzerInput = () => (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <span className="text-xs font-mono font-semibold text-lumina-orange uppercase tracking-wider block mb-1">
          Target Acquisition
        </span>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-white mb-2">
          Scan Competitor Vulnerabilities
        </h1>
        <p className="text-sm text-zinc-400">
          Enter any software product or choose a titan from our quick selector to harvest verified user frustration.
        </p>
      </div>

      {/* Quick Select Presets */}
      <div className="mb-6 p-4 rounded-lg bg-lumina-surface border border-lumina-border">
        <span className="text-xs font-mono text-zinc-400 block mb-3 font-semibold uppercase">
          Quick Preset Selection:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_COMPETITORS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setCompetitorName(p.name);
                setCompetitorDesc(p.desc);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                competitorName === p.name
                  ? 'bg-lumina-orange text-white font-bold'
                  : 'bg-[#141416] text-zinc-300 hover:text-white border border-[#26262B]'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Competitor Name
            </label>
            <input 
              type="text" 
              className="w-full bg-[#141416] border border-lumina-border rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-lumina-orange transition-colors text-sm font-sans"
              placeholder="e.g. Spotify, Salesforce, Notion, Jira"
              value={competitorName}
              onChange={(e) => setCompetitorName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Product Description / Workflow Context
            </label>
            <textarea 
              rows={3}
              className="w-full bg-[#141416] border border-lumina-border rounded-lg p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-lumina-orange transition-colors text-sm font-sans leading-relaxed"
              placeholder="e.g. Subscription music streaming app with 600M users, desktop player, and mobile apps"
              value={competitorDesc}
              onChange={(e) => setCompetitorDesc(e.target.value)}
            />
          </div>
          
          {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 text-xs flex items-center font-mono">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button 
              size="lg"
              className="flex-1" 
              onClick={() => handleStartAnalysis()}
              disabled={!competitorName || !competitorDesc}
            >
              <span>Initiate Deep Scan</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            
            <button
              onClick={() => {
                setCurrentAnalysis(INITIAL_ANALYSIS);
                setAppState(AppState.INSIGHTS);
              }}
              className="px-5 py-3.5 text-xs font-mono rounded-lg border border-lumina-border text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Load Demo Data
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  /* =========================================================================
     ANALYZING PROGRESS VIEW
     ========================================================================= */
  const renderAnalyzing = () => (
    <div className="h-[75vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-2 border-white/10 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
        <div className="absolute inset-0 bg-lumina-orange/20 rounded-full blur-xl -z-10 animate-pulse"></div>
      </div>
      
      <span className="text-xs font-mono font-semibold text-lumina-orange tracking-widest uppercase mb-2">
        Active Extraction Pipeline
      </span>
      <h2 className="text-3xl font-medium tracking-tight text-white mb-3">
        Analyzing {competitorName || 'Competitor'}
      </h2>
      <p className="text-zinc-400 text-sm max-w-md font-mono">
        {analysisStep || 'Ingesting customer reviews...'}
      </p>
    </div>
  );

  /* =========================================================================
     INSIGHTS VIEW
     ========================================================================= */
  const renderInsights = () => {
    if (!currentAnalysis) return null;

    const filteredReviews = activeReviewFilter === 'all' 
      ? currentAnalysis.reviews 
      : currentAnalysis.reviews.filter(r => r.source === activeReviewFilter);

    return (
      <div className="space-y-8 animate-in fade-in duration-300 pb-16">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-lumina-border">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-3xl font-medium tracking-tight text-white">
                {currentAnalysis.competitorName}
              </h1>
              <Badge variant="orange" mono={true}>Vulnerability Mapped</Badge>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Sample: {currentAnalysis.totalReviewsAnalyzed} reviews · Scanned: {currentAnalysis.dateAnalyzed}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setAppState(AppState.ANALYZER_INPUT)}
              className="px-4 py-2 text-xs font-mono rounded-lg border border-lumina-border text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Scan Another
            </button>
            <Button onClick={handleGenerateBlueprint} size="md">
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Draft Product Blueprint</span>
            </Button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <span className="text-xs font-mono text-zinc-500 uppercase font-semibold block mb-2">
              Average Rating
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">
                {currentAnalysis.averageRating.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-zinc-500">/ 5.0</span>
            </div>
          </Card>

          <Card className="p-6">
            <span className="text-xs font-mono text-zinc-500 uppercase font-semibold block mb-2">
              Primary Vulnerability
            </span>
            <div className="text-xl font-semibold text-lumina-orange truncate">
              {currentAnalysis.painPoints[0]?.category || 'Pricing Traps'}
            </div>
          </Card>

          <Card className="p-6">
            <span className="text-xs font-mono text-zinc-500 uppercase font-semibold block mb-2">
              Critical Feature Gaps
            </span>
            <div className="text-4xl font-extrabold text-white">
              {currentAnalysis.featureGaps.filter(g => g.demandLevel === 'Critical').length}
            </div>
          </Card>

          <Card className="p-6">
            <span className="text-xs font-mono text-zinc-500 uppercase font-semibold block mb-2">
              Opportunity Potential
            </span>
            <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>High Churn</span>
            </div>
          </Card>
        </div>

        {/* Sentiment Summary Callout */}
        <div className="bg-lumina-surface border border-lumina-border rounded-lg p-6 relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-mono text-lumina-orange font-semibold uppercase tracking-wider mb-2">
            <Quote className="w-3.5 h-3.5" />
            <span>Executive Sentiment Synthesis</span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed font-normal max-w-4xl">
            {currentAnalysis.sentimentSummary}
          </p>
        </div>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Pain Point Spectrum & Rating Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-7">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-lumina-orange" />
                  <h3 className="text-base font-semibold text-white">Complaint Frequency by Category</h3>
                </div>
                <span className="text-xs font-mono text-zinc-400">Relative Mention Volume</span>
              </div>
              <PainPointChart data={currentAnalysis.painPoints} />
            </Card>

            {/* Scraped Reviews Feed */}
            <Card className="p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-lumina-orange" />
                  <h3 className="text-base font-semibold text-white">Customer Grievance Stream</h3>
                </div>

                {/* Filter buttons */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-[#141416] border border-[#26262B]">
                  {(['all', 'App Store', 'Play Store', 'G2', 'Twitter'] as const).map((source) => (
                    <button
                      key={source}
                      onClick={() => setActiveReviewFilter(source)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-colors ${
                        activeReviewFilter === source 
                          ? 'bg-lumina-orange text-white font-semibold' 
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredReviews.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-mono py-8 text-center">No reviews match this filter.</p>
                ) : (
                  filteredReviews.map((review, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-[#141416] border border-[#242428] hover:border-zinc-700 transition-colors">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white font-sans">{review.author}</span>
                          <span className="text-zinc-500 font-mono">·</span>
                          <span className="text-zinc-400 font-mono text-[11px]">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-lumina-orange/15 text-lumina-orange">
                            {review.rating}★
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono uppercase">{review.source}</span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                        "{review.content}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Feature Gaps & Rating Breakdown Bar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Rating Erosion Breakdown</h3>
              <RatingBreakdownBar 
                averageRating={currentAnalysis.averageRating} 
                totalReviews={currentAnalysis.totalReviewsAnalyzed} 
              />
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-lumina-orange" />
                <h3 className="text-base font-semibold text-white">Begged-For Capabilities</h3>
              </div>
              <div className="space-y-3">
                {currentAnalysis.featureGaps.map((gap, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-[#141416] border border-[#242428]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-white">{gap.featureName}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                        gap.demandLevel === 'Critical' 
                          ? 'bg-lumina-orange/20 text-lumina-orange' 
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {gap.demandLevel}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      {gap.context}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>
      </div>
    );
  };

  /* =========================================================================
     PRODUCT BLUEPRINT VIEW (Lumina Aesthetic)
     ========================================================================= */
  const renderBlueprint = () => {
    if (!blueprint || !currentAnalysis) return null;

    return (
      <div className="space-y-8 animate-in fade-in duration-300 pb-20">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between pb-6 border-b border-lumina-border">
          <button 
            onClick={() => setAppState(AppState.INSIGHTS)}
            className="flex items-center gap-2 text-xs font-mono font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180 text-lumina-orange" />
            <span>Return to {currentAnalysis.competitorName} Insights</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={copyBlueprintText}
              className="flex items-center gap-1.5 text-xs font-mono px-3.5 py-2 rounded-lg border border-lumina-border text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
            >
              {copiedBlueprint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBlueprint ? 'Copied Markdown' : 'Copy Blueprint'}</span>
            </button>
            <Button size="sm" onClick={() => window.print()}>
              <Download className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </Button>
          </div>
        </div>

        {/* Blueprint Document Container */}
        <div className="max-w-4xl mx-auto bg-lumina-surface border border-lumina-border rounded-lg overflow-hidden shadow-2xl">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#201815] to-[#161618] border-b border-lumina-border p-8 sm:p-12 relative">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-lumina-orange uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4" />
              <span>SaaS Blueprint Synthesized from {currentAnalysis.competitorName} Friction</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-white mb-4">
              {blueprint.productName}
            </h1>
            <p className="text-lg text-lumina-orange font-normal max-w-2xl leading-relaxed">
              {blueprint.tagline}
            </p>
          </div>

          <div className="p-8 sm:p-12 space-y-12">
            
            {/* Value Proposition */}
            <div>
              <span className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider block mb-3">
                Value Proposition
              </span>
              <div className="p-6 rounded-lg bg-[#141416] border-l-2 border-lumina-orange text-lg sm:text-xl font-sans text-zinc-200 leading-relaxed italic">
                "{blueprint.valueProposition}"
              </div>
            </div>

            {/* Core Antidote Features */}
            <div>
              <span className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider block mb-6">
                Antidote Feature Matrix
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {blueprint.coreFeatures.map((feature, idx) => (
                  <div key={idx} className="p-5 rounded-lg bg-[#141416] border border-[#26262B] hover:border-lumina-orange/40 transition-colors">
                    <span className="text-xs font-mono text-lumina-orange font-bold block mb-1">
                      0{idx + 1}. Antidote
                    </span>
                    <h4 className="text-base font-semibold text-white mb-2">{feature.title}</h4>
                    <p className="text-xs text-zinc-400 mb-4 leading-relaxed font-sans">{feature.description}</p>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                      <TrendingDown className="w-3 h-3" />
                      <span>Neutralizes: {feature.solvesGap}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Positioning & Takeout Angles */}
            <div>
              <span className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider block mb-4">
                Competitive Takeout & Ad Angles
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {blueprint.marketingAngles.map((angle, idx) => (
                  <div key={idx} className="p-5 rounded-lg bg-[#141416] border border-[#26262B] flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-2 font-bold">Angle 0{idx + 1}</span>
                    <p className="text-xs font-semibold text-white leading-relaxed">
                      "{angle}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  /* =========================================================================
     DASHBOARD VIEW
     ========================================================================= */
  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-lumina-border">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-white mb-1">Radar Dashboard</h1>
          <p className="text-xs text-zinc-400 font-mono">Real-time competitor surveillance and mapped opportunities</p>
        </div>
        <Button onClick={() => setAppState(AppState.ANALYZER_INPUT)} size="md">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Competitor Scan</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6">
          <span className="text-xs font-mono text-zinc-500 uppercase font-semibold block mb-2">Tracked Competitors</span>
          <div className="text-4xl font-extrabold text-white">5</div>
          <p className="text-xs text-zinc-500 font-mono mt-2">Active market monitors</p>
        </Card>
        <Card className="p-6">
          <span className="text-xs font-mono text-zinc-500 uppercase font-semibold block mb-2">Discovered Gaps</span>
          <div className="text-4xl font-extrabold text-lumina-orange">19</div>
          <p className="text-xs text-zinc-500 font-mono mt-2">High-demand opportunities</p>
        </Card>
        <Card className="p-6">
          <span className="text-xs font-mono text-zinc-500 uppercase font-semibold block mb-2">Generated Blueprints</span>
          <div className="text-4xl font-extrabold text-white">4</div>
          <p className="text-xs text-zinc-500 font-mono mt-2">Ready for landing page tests</p>
        </Card>
      </div>

      {/* Competitors List */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-white mb-4">Competitor Surveillance Database</h3>
        <div className="divide-y divide-lumina-border">
          {PRESET_COMPETITORS.map((c, idx) => (
            <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-lumina-orange/15 border border-lumina-orange/30 flex items-center justify-center font-mono text-xs font-bold text-lumina-orange">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{c.name}</h4>
                  <p className="text-xs text-zinc-400">{c.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStartAnalysis(c.name, c.desc)}
                >
                  Run Deep Scan
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  /* =========================================================================
     SETTINGS VIEW
     ========================================================================= */
  const renderSettings = () => (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="pb-6 border-b border-lumina-border">
        <h1 className="text-3xl font-medium tracking-tight text-white mb-1">Account & Settings</h1>
        <p className="text-xs text-zinc-400 font-mono">Manage subscription tier and system configurations</p>
      </div>

      <Card className="p-8 space-y-6">
        <h3 className="text-base font-semibold text-white">Subscription Status</h3>
        <div className="p-4 rounded-lg bg-[#141416] border border-[#26262B] flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-lumina-orange font-bold uppercase">Pro Founder Tier</span>
            <p className="text-xs text-zinc-400 mt-1">Unlimited Scans · Generative Blueprints Active</p>
          </div>
          <Badge variant="emerald">Active</Badge>
        </div>
      </Card>

      <Card className="p-8 space-y-6">
        <h3 className="text-base font-semibold text-white">AI Engine Configuration</h3>
        <div className="p-4 rounded-lg bg-[#141416] border border-[#26262B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-white">Server-Side Gemini 3.8 Flash</p>
              <p className="text-xs text-zinc-500 font-mono">Managed securely in Settings &gt; Secrets</p>
            </div>
          </div>
          <span className="text-xs font-mono text-zinc-400">100% Operational</span>
        </div>
      </Card>
    </div>
  );

  return (
    <Layout activeState={appState} onNavigate={setAppState}>
      {appState === AppState.LANDING && renderLandingPage()}
      {appState === AppState.DASHBOARD && renderDashboard()}
      {appState === AppState.ANALYZER_INPUT && renderAnalyzerInput()}
      {appState === AppState.ANALYZING && renderAnalyzing()}
      {appState === AppState.INSIGHTS && renderInsights()}
      {appState === AppState.BLUEPRINT && renderBlueprint()}
      {appState === AppState.SETTINGS && renderSettings()}
    </Layout>
  );
}