import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Card, Button, Badge, LoadingSpinner } from './components/UIComponents';
import { PainPointChart } from './components/Charts';
import { AppState, CompetitorAnalysis, ProductBlueprint } from './types';
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
  Quote
} from 'lucide-react';
import { GapHunterLogo } from './components/Logo';

const INITIAL_ANALYSIS: CompetitorAnalysis = {
  id: 'demo',
  competitorName: 'Salesforce (Demo)',
  totalReviewsAnalyzed: 124,
  averageRating: 2.1,
  dateAnalyzed: new Date().toLocaleDateString(),
  sentimentSummary: "Users are heavily frustrated by the complexity of the UI and the steep learning curve. Pricing is a major point of contention for small businesses.",
  painPoints: [
    { category: 'Pricing', count: 45, description: 'Hidden fees and high base cost', severity: 'High' },
    { category: 'UX/UI', count: 38, description: 'Cluttered interface, hard to navigate', severity: 'High' },
    { category: 'Support', count: 22, description: 'Slow response times on lower tiers', severity: 'Medium' },
    { category: 'Performance', count: 12, description: 'Slow loading on dashboards', severity: 'Medium' },
  ],
  featureGaps: [
    { featureName: 'Simple Export', demandLevel: 'Critical', context: 'Users want 1-click CSV export without wizard' },
    { featureName: 'Dark Mode', demandLevel: 'Nice to Have', context: 'Requested for late night work' },
  ],
  reviews: []
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

  // Landing Page State
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleStartAnalysis = async () => {
    if (!competitorName || !competitorDesc) return;
    
    setIsAnalyzing(true);
    setAppState(AppState.ANALYZING);
    setError(null);
    setAnalysisStep('Scraping public reviews...');

    try {
      const reviews = await fetchMockReviews(competitorName, competitorDesc);
      
      setAnalysisStep(`Analyzing ${reviews.length} reviews with Gemini 2.5...`);
      const analysisData = await analyzeCompetitorReviews(competitorName, reviews);
      
      const fullAnalysis: CompetitorAnalysis = {
        id: Date.now().toString(),
        competitorName,
        competitorUrl: '',
        dateAnalyzed: new Date().toLocaleDateString(),
        totalReviewsAnalyzed: reviews.length,
        averageRating: analysisData.averageRating || 0,
        sentimentSummary: analysisData.sentimentSummary || '',
        painPoints: analysisData.painPoints || [],
        featureGaps: analysisData.featureGaps || [],
        reviews: reviews,
      };

      setCurrentAnalysis(fullAnalysis);
      setAppState(AppState.INSIGHTS);
    } catch (err: any) {
      console.error(err);
      setError('Analysis failed. Please check your API key or try again.');
      setAppState(AppState.ANALYZER_INPUT);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateBlueprint = async () => {
    if (!currentAnalysis) return;
    setIsAnalyzing(true);
    setAppState(AppState.ANALYZING);
    setAnalysisStep('Drafting Product Blueprint...');

    try {
      const generatedBlueprint = await generateProductBlueprint(currentAnalysis);
      setBlueprint(generatedBlueprint);
      setCurrentAnalysis({ ...currentAnalysis, blueprint: generatedBlueprint });
      setAppState(AppState.BLUEPRINT);
    } catch (err) {
      setError('Failed to generate blueprint.');
      setAppState(AppState.INSIGHTS);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const renderLandingPage = () => (
    <div className="min-h-screen bg-black text-white font-mono overflow-x-hidden">
      
      {/* Floating Notification Bar */}
      <div className="sticky top-0 z-[1000] bg-white text-black text-center py-2 border-b border-[#333] shadow-lg">
        <span className="font-bold uppercase tracking-widest text-xs md:text-sm animate-pulse">
          CLICK 'GET STARTED' TO TEST THE APP
        </span>
      </div>

      {/* Navbar Section */}
      <section id="navbar" className="relative z-[999] flex min-h-20 w-full items-center border-b border-[#333] bg-black px-[5%]">
        <div className="mx-auto flex size-full max-w-full items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setAppState(AppState.LANDING)}>
             <GapHunterLogo className="w-8 h-8 text-white" />
             <span className="text-xl font-bold tracking-widest uppercase">GapHunter</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-12">
             <a href="#features" className="text-sm font-medium hover:text-gray-300 uppercase tracking-wide">Features</a>
             <a href="#pricing" className="text-sm font-medium hover:text-gray-300 uppercase tracking-wide">Pricing</a>
             <a href="#faq" className="text-sm font-medium hover:text-gray-300 uppercase tracking-wide">FAQ</a>
          </div>

          <div className="hidden lg:flex items-center gap-4">
             <button onClick={() => setAppState(AppState.DASHBOARD)} className="px-5 py-2 text-sm font-medium border border-[#333] bg-black hover:bg-[#111] text-white transition-colors uppercase tracking-wide">
                Sign In
             </button>
             <button onClick={() => setAppState(AppState.ANALYZER_INPUT)} className="px-5 py-2 text-sm font-bold border border-white bg-white text-black hover:bg-gray-200 transition-colors uppercase tracking-wide">
                Get Started
             </button>
          </div>

          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             <Menu className="w-6 h-6" />
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full w-full bg-black border-b border-[#333] p-4 lg:hidden flex flex-col gap-4 z-50">
             <a href="#features" className="py-2 uppercase font-bold" onClick={() => setMobileMenuOpen(false)}>Features</a>
             <a href="#pricing" className="py-2 uppercase font-bold" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
             <button onClick={() => setAppState(AppState.DASHBOARD)} className="w-full text-left py-2 uppercase font-bold">Sign In</button>
          </div>
        )}
      </section>

      {/* Hero Section */}
      <section className="px-[5%] py-20 md:py-32 border-b border-[#333]">
        <div className="container mx-auto animate-in fade-in duration-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div className="flex flex-col justify-center">
                <div className="inline-block border border-white/30 px-3 py-1 mb-6 w-fit">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-300">v2.0_Public_Beta</span>
                </div>
                <h1 className="mb-6 text-5xl font-bold md:mb-8 md:text-8xl lg:text-7xl tracking-tighter uppercase leading-[0.9]">
                   Build what <br/> users want.
                </h1>
                <p className="mb-10 text-lg text-gray-400 md:text-xl max-w-lg leading-relaxed">
                   Stop guessing. GapHunter analyzes competitor reviews to uncover the features users are begging for.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                   <button 
                      onClick={() => setAppState(AppState.ANALYZER_INPUT)}
                      className="px-8 py-4 text-base font-bold bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all uppercase tracking-wide"
                   >
                      Start Hunting
                   </button>
                   <button 
                      onClick={() => setAppState(AppState.DASHBOARD)}
                      className="px-8 py-4 text-base font-bold bg-black text-white border border-[#333] hover:border-white transition-all uppercase tracking-wide"
                   >
                      View Demo
                   </button>
                </div>
             </div>
             <div className="relative">
                <div className="relative rounded-lg overflow-hidden border border-[#27272a] shadow-2xl">
                    <div className="aspect-video bg-[#10141d] relative">
                        <img 
                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop" 
                            alt="Dashboard Preview" 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section id="features" className="px-[5%] py-20 md:py-32 border-b border-[#333]">
         <div className="container mx-auto">
            <div className="mb-16 md:mb-24 max-w-2xl mx-auto text-center">
               <p className="mb-4 font-bold text-gray-500 uppercase tracking-widest text-xs">// Analysis</p>
               <h2 className="mb-6 text-4xl font-bold md:text-6xl uppercase tracking-tighter">Identify patterns</h2>
               <p className="text-gray-400 text-lg">Spot what users complain about most across G2, Capterra, and App Stores.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-[#333]">
               {/* Large Item */}
               <div className="relative p-10 sm:col-span-2 bg-black border-r border-b border-[#333] flex flex-col justify-end min-h-[350px] overflow-hidden group">
                  <img 
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
                      alt="Market Intelligence" 
                      className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                  <div className="relative z-10">
                     <h3 className="mb-3 text-2xl font-bold uppercase tracking-tight">Market Intelligence</h3>
                     <p className="text-gray-400">See the full picture of your competitor's weaknesses.</p>
                  </div>
               </div>
               
               {/* Small Items */}
               <div className="relative p-10 bg-black border-r border-b border-[#333] flex flex-col justify-between min-h-[350px] overflow-hidden group">
                  <img 
                      src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=2676&auto=format&fit=crop" 
                      alt="Data Driven" 
                      className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                  <div className="relative z-10">
                      <BarChart3 className="w-12 h-12 text-white mb-6" />
                      <div>
                         <h3 className="mb-2 text-xl font-bold uppercase tracking-tight">Data Driven</h3>
                         <p className="text-gray-400 text-sm">Quantify user pain points.</p>
                      </div>
                  </div>
               </div>

               <div className="relative p-10 bg-black border-r border-b border-[#333] flex flex-col justify-between min-h-[350px] overflow-hidden group">
                   <img 
                      src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2080" 
                      alt="Fast Action" 
                      className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                  <div className="relative z-10">
                      <Zap className="w-12 h-12 text-white mb-6" />
                      <div>
                         <h3 className="mb-2 text-xl font-bold uppercase tracking-tight">Fast Action</h3>
                         <p className="text-gray-400 text-sm">Turn insights into features.</p>
                      </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Sticky Scroll Section */}
      <section className="border-b border-[#333]">
         {/* Feature 1 */}
         <div className="sticky top-0 bg-black border-b border-[#333] z-10">
            <div className="px-[5%] py-20 md:py-32">
               <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                     <span className="font-mono text-xs mb-6 block text-gray-500 uppercase tracking-widest border-l-2 border-white pl-3">Step_01</span>
                     <h2 className="text-4xl md:text-6xl font-bold mb-6 uppercase tracking-tighter">Select Competitors</h2>
                     <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                        Pick the SaaS products your target market uses. We handle the rest, pulling reviews from every major platform and marketplace where users leave feedback to build a comprehensive dataset.
                     </p>
                     <div className="flex gap-4">
                        <button className="px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-colors uppercase font-bold text-sm tracking-wide">Browse Apps</button>
                     </div>
                  </div>
                  <div className="h-[400px] bg-[#050505] border border-[#333] flex items-center justify-center relative overflow-hidden">
                     {/* Abstract Representation */}
                     <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-px bg-[#333] opacity-20">
                        {Array.from({ length: 36 }).map((_, i) => <div key={i} className="bg-black"></div>)}
                     </div>
                     <div className="w-2/3 space-y-4 relative z-10">
                        <div className="h-14 bg-[#1a1a1a] border border-[#333] w-full flex items-center px-4">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                        <div className="h-14 bg-[#1a1a1a] border border-[#333] w-full flex items-center px-4">
                            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                        </div>
                        <div className="h-14 bg-[#1a1a1a] border border-[#333] w-full flex items-center px-4">
                            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Feature 2 */}
         <div className="sticky top-0 bg-black border-b border-[#333] z-20">
            <div className="px-[5%] py-20 md:py-32">
               <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                     <span className="font-mono text-xs mb-6 block text-gray-500 uppercase tracking-widest border-l-2 border-white pl-3">Step_02</span>
                     <h2 className="text-4xl md:text-6xl font-bold mb-6 uppercase tracking-tighter">We Analyze</h2>
                     <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                        Our AI processes thousands of reviews to identify recurring complaints, sentiment trends, and critical feature gaps.
                     </p>
                     <div className="flex gap-4">
                        <button className="px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-colors uppercase font-bold text-sm tracking-wide">View Sample</button>
                     </div>
                  </div>
                  <div className="h-[400px] bg-[#050505] border border-[#333] flex items-center justify-center p-8 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 font-mono text-xs text-green-500">ANALYSIS_RUNNING...</div>
                     <div className="w-full h-full bg-black border border-[#333] p-8 relative">
                        <div className="flex justify-between mb-8">
                           <div className="w-24 h-4 bg-[#222]"></div>
                           <div className="w-12 h-4 bg-white/20"></div>
                        </div>
                        <div className="space-y-3">
                           <div className="w-full h-2 bg-[#222]"></div>
                           <div className="w-full h-2 bg-[#222]"></div>
                           <div className="w-2/3 h-2 bg-[#222]"></div>
                           <div className="w-3/4 h-2 bg-[#222]"></div>
                        </div>
                        <div className="absolute bottom-8 left-8 right-8 h-20 border-t border-[#333] pt-4 flex gap-2 items-end">
                            <div className="w-1/5 h-1/3 bg-[#222]"></div>
                            <div className="w-1/5 h-2/3 bg-[#222]"></div>
                            <div className="w-1/5 h-full bg-white"></div>
                            <div className="w-1/5 h-1/2 bg-[#222]"></div>
                            <div className="w-1/5 h-1/4 bg-[#222]"></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Feature 3 */}
         <div className="sticky top-0 bg-black border-b border-[#333] z-30">
            <div className="px-[5%] py-20 md:py-32">
               <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                     <span className="font-mono text-xs mb-6 block text-gray-500 uppercase tracking-widest border-l-2 border-white pl-3">Step_03</span>
                     <h2 className="text-4xl md:text-6xl font-bold mb-6 uppercase tracking-tighter">You Build</h2>
                     <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                        Generate a comprehensive product blueprint that solves the exact problems users are facing. Launch with confidence.
                     </p>
                     <div className="flex gap-4">
                        <button className="px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-colors uppercase font-bold text-sm tracking-wide">Generate Blueprint</button>
                     </div>
                  </div>
                  <div className="h-[400px] bg-[#050505] border border-[#333] flex items-center justify-center">
                     <Rocket className="w-32 h-32 text-white stroke-1" />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-[5%] py-20 md:py-32 border-b border-[#333] bg-black">
        <div className="container mx-auto">
          <div className="text-left mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 uppercase tracking-tighter">Trusted by 1,000+ Founders</h2>
            <p className="text-gray-400 text-lg">See how product teams are using GapHunter to win their market.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-[#333]">
            {/* Testimonial 1 */}
            <div className="p-10 bg-black border-r border-b border-[#333] relative group hover:bg-[#0a0a0a] transition-colors">
              <Quote className="absolute top-8 right-8 w-12 h-12 text-[#222] group-hover:text-white/10 transition-colors" />
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-white mr-4 flex items-center justify-center text-black font-bold">SJ</div>
                <div>
                  <div className="font-bold text-white uppercase tracking-wide">Sarah Jenkins</div>
                  <div className="text-xs text-gray-500 font-mono">FOUNDER @ TECHFLOW</div>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed relative z-10 font-light">
                "GapHunter saved us months of dev time. We almost built a feature nobody wanted. Instead, we focused on the exact pain points our competitor's users were complaining about."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="p-10 bg-black border-r border-b border-[#333] relative group hover:bg-[#0a0a0a] transition-colors">
              <Quote className="absolute top-8 right-8 w-12 h-12 text-[#222] group-hover:text-white/10 transition-colors" />
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-[#222] mr-4 flex items-center justify-center text-white font-bold">MC</div>
                <div>
                  <div className="font-bold text-white uppercase tracking-wide">Michael Chen</div>
                  <div className="text-xs text-gray-500 font-mono">PM @ SAASCALE</div>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed relative z-10 font-light">
                "The competitor analysis is scary good. It found pricing complaints I didn't even know existed in our market. We adjusted our tier structure and conversions went up 40%."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="p-10 bg-black border-r border-b border-[#333] relative group hover:bg-[#0a0a0a] transition-colors">
              <Quote className="absolute top-8 right-8 w-12 h-12 text-[#222] group-hover:text-white/10 transition-colors" />
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-[#222] mr-4 flex items-center justify-center text-white font-bold">AR</div>
                <div>
                  <div className="font-bold text-white uppercase tracking-wide">Alex Rivera</div>
                  <div className="text-xs text-gray-500 font-mono">INDIE HACKER</div>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed relative z-10 font-light">
                "Finally, a way to validate ideas without guessing. The blueprint feature generated a marketing angle I hadn't considered. Worth every penny."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Tabs */}
      <section id="pricing" className="px-[5%] py-20 md:py-32 border-b border-[#333]">
         <div className="container mx-auto">
            <div className="mx-auto mb-16 max-w-lg text-center">
               <p className="font-bold mb-4 text-gray-500 uppercase tracking-widest text-xs">// Plans</p>
               <h2 className="text-5xl font-bold md:text-7xl mb-6 uppercase tracking-tighter">Simple Pricing</h2>
               <p className="text-gray-400">Choose the plan that fits your growth stage.</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex justify-center mb-16">
               <div className="inline-flex border border-[#333] bg-black p-1">
                  <button 
                     onClick={() => setBillingCycle('monthly')}
                     className={`px-8 py-3 text-sm font-bold uppercase tracking-wide transition-all ${billingCycle === 'monthly' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                  >
                     Monthly
                  </button>
                  <button 
                     onClick={() => setBillingCycle('yearly')}
                     className={`px-8 py-3 text-sm font-bold uppercase tracking-wide transition-all ${billingCycle === 'yearly' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                  >
                     Yearly
                  </button>
               </div>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-[#333]">
               {/* Starter */}
               <div className="bg-black p-10 flex flex-col border-r border-[#333]">
                  <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">Starter</h3>
                  <p className="text-gray-500 mb-10 text-sm font-mono">FOR SOLO FOUNDERS</p>
                  <div className="text-6xl font-bold mb-10 tracking-tighter">${billingCycle === 'monthly' ? '19' : '15'}</div>
                  <button onClick={() => setAppState(AppState.ANALYZER_INPUT)} className="w-full py-4 mb-10 border border-[#333] text-white hover:border-white hover:bg-white hover:text-black transition-colors font-bold uppercase text-sm tracking-wide">Get Started</button>
                  <div className="space-y-5 text-sm text-gray-400 font-mono">
                     <div className="flex items-center"><Check className="w-4 h-4 mr-3 text-white" /> 5 Competitor Apps</div>
                     <div className="flex items-center"><Check className="w-4 h-4 mr-3 text-white" /> Basic Analysis</div>
                     <div className="flex items-center"><Check className="w-4 h-4 mr-3 text-white" /> Monthly Reports</div>
                  </div>
               </div>

               {/* Builder */}
               <div className="bg-[#050505] p-10 flex flex-col border-r border-[#333] relative">
                  <div className="absolute top-0 right-0 bg-white text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">POPULAR</div>
                  <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">Builder</h3>
                  <p className="text-gray-500 mb-10 text-sm font-mono">FOR PRODUCT TEAMS</p>
                  <div className="text-6xl font-bold mb-10 tracking-tighter">${billingCycle === 'monthly' ? '49' : '39'}</div>
                  <button onClick={() => setAppState(AppState.ANALYZER_INPUT)} className="w-full py-4 mb-10 bg-white text-black hover:bg-gray-200 transition-colors font-bold uppercase text-sm tracking-wide">Get Started</button>
                  <div className="space-y-5 text-sm text-gray-300 font-mono">
                     <div className="flex items-center"><Check className="w-4 h-4 mr-3" /> 20 Competitor Apps</div>
                     <div className="flex items-center"><Check className="w-4 h-4 mr-3" /> Advanced Filtering</div>
                     <div className="flex items-center"><Check className="w-4 h-4 mr-3" /> Weekly Updates</div>
                     <div className="flex items-center"><Check className="w-4 h-4 mr-3" /> Export to CSV</div>
                  </div>
               </div>

               {/* Enterprise */}
               <div className="bg-black p-10 flex flex-col">
                  <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">Enterprise</h3>
                  <p className="text-gray-500 mb-10 text-sm font-mono">FOR SERIOUS OPERATORS</p>
                  <div className="text-6xl font-bold mb-10 tracking-tighter">${billingCycle === 'monthly' ? '99' : '79'}</div>
                  <button onClick={() => setAppState(AppState.ANALYZER_INPUT)} className="w-full py-4 mb-10 border border-[#333] text-white hover:border-white hover:bg-white hover:text-black transition-colors font-bold uppercase text-sm tracking-wide">Get Started</button>
                  <div className="space-y-5 text-sm text-gray-400 font-mono">
                     <div className="flex items-center"><Check className="w-4 h-4 mr-3 text-white" /> Unlimited Apps</div>
                     <div className="flex items-center"><Check className="w-4 h-4 mr-3 text-white" /> Custom Analysis</div>
                     <div className="flex items-center"><Check className="w-4 h-4 mr-3 text-white" /> API Access</div>
                     <div className="flex items-center"><Check className="w-4 h-4 mr-3 text-white" /> Priority Support</div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* FAQ - Accordion */}
      <section id="faq" className="px-[5%] py-20 md:py-32 border-b border-[#333]">
         <div className="container mx-auto max-w-3xl">
            <div className="text-left mb-16">
               <h2 className="text-5xl font-bold mb-6 uppercase tracking-tighter">FAQs</h2>
               <p className="text-gray-400">Common questions about GapHunter.</p>
            </div>
            
            <div className="border-t border-[#333]">
               {[
                 { q: "How accurate is the review analysis?", a: "We use advanced LLMs (Gemini 2.5) to parse thousands of reviews. While AI can occasionally hallucinate, our system is designed to cross-reference multiple data points to ensure high reliability." },
                 { q: "Which platforms do you scrape?", a: "Currently, we support G2, Capterra, TrustRadius, Google Play Store, and Apple App Store. We are adding Reddit and Twitter support soon." },
                 { q: "Can I export the data?", a: "Yes! On the Builder and Enterprise plans, you can export all findings, including raw reviews and the product blueprint, to PDF and CSV formats." },
                 { q: "Is there a free trial?", a: "Yes, you can run one comprehensive analysis for free to see the power of the platform. No credit card required." }
               ].map((item, index) => (
                  <div key={index} className="border-b border-[#333]">
                     <button 
                        className="w-full py-8 flex items-center justify-between text-left focus:outline-none group"
                        onClick={() => toggleFaq(index)}
                     >
                        <div className="flex items-center gap-4">
                           {/* Add icon based on index or content type if desired, kept simple for now or use Lucide icons */}
                           {index === 0 && <Target className="w-5 h-5 text-gray-500" />}
                           {index === 1 && <Sparkles className="w-5 h-5 text-gray-500" />}
                           {index === 2 && <TrendingDown className="w-5 h-5 text-gray-500" />}
                           {index === 3 && <ShieldCheck className="w-5 h-5 text-gray-500" />}
                           <span className="font-bold text-lg uppercase tracking-tight group-hover:text-gray-300">{item.q}</span>
                        </div>
                        {openFaq === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                     </button>
                     <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-48 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-[#0a0a0a] p-6 border border-[#333] ml-9">
                           <p className="text-gray-400 font-light leading-relaxed">{item.a}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            <div className="mt-24 text-center border border-[#333] p-12 bg-[#050505]">
               <h4 className="text-2xl font-bold mb-4 uppercase tracking-tight">Still have questions?</h4>
               <p className="text-gray-400 mb-8 font-mono text-sm">SUPPORT@GAPHUNTER.COM</p>
               <button className="px-8 py-3 bg-white text-black hover:bg-gray-200 uppercase font-bold text-sm tracking-wide">Contact Support</button>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="px-[5%] py-20 bg-black">
         <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.5fr] gap-16 mb-16">
               <div>
                  <div className="flex items-center space-x-2 mb-8">
                     <GapHunterLogo className="w-8 h-8 text-white" />
                     <span className="text-xl font-bold uppercase tracking-widest">GapHunter</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm font-bold uppercase tracking-wide">
                     <a href="#" className="hover:text-gray-400">Features</a>
                     <a href="#" className="hover:text-gray-400">Pricing</a>
                     <a href="#" className="hover:text-gray-400">About</a>
                     <a href="#" className="hover:text-gray-400">Careers</a>
                     <a href="#" className="hover:text-gray-400">Blog</a>
                  </div>
               </div>
               <div>
                  <p className="font-bold mb-4 uppercase tracking-widest text-xs text-gray-500">Subscribe to newsletter</p>
                  <div className="flex gap-0">
                     <input type="email" placeholder="ENTER YOUR EMAIL" className="bg-black border border-[#333] px-4 py-3 w-full text-white focus:outline-none focus:border-white font-mono text-sm uppercase placeholder-gray-700" />
                     <button className="px-6 py-3 border-t border-r border-b border-white bg-white text-black hover:bg-gray-200 font-bold uppercase text-sm">Join</button>
                  </div>
               </div>
            </div>
            
            <div className="h-px bg-[#333] w-full mb-8"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-mono uppercase">
               <div className="flex gap-8 mb-4 md:mb-0">
                  <a href="#" className="hover:text-white">Privacy Policy</a>
                  <a href="#" className="hover:text-white">Terms of Service</a>
                  <a href="#" className="hover:text-white">Cookies Settings</a>
               </div>
               <p>© 2024 GapHunter. All rights reserved.</p>
            </div>
         </div>
      </footer>

    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-[#333] pb-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase">Dashboard</h1>
          <p className="text-gray-400 mt-1 font-mono text-sm">Overview of your market intelligence.</p>
        </div>
        <Button onClick={() => setAppState(AppState.ANALYZER_INPUT)} variant="primary" className="bg-white text-black hover:bg-gray-200 border-none">
          <Plus className="w-4 h-4 mr-2" />
          New Analysis
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#333]">
        <div className="p-8 border-r border-[#333] bg-black">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Competitors</div>
          <div className="text-5xl font-bold text-white mb-2 tracking-tighter">12</div>
          <div className="text-emerald-500 text-xs font-bold flex items-center uppercase tracking-wide">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Active
          </div>
        </div>
        <div className="p-8 border-r border-[#333] bg-black">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Feature Gaps</div>
          <div className="text-5xl font-bold text-white mb-2 tracking-tighter">84</div>
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wide">Across 3 verticals</div>
        </div>
        <div className="p-8 bg-black">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Blueprints</div>
          <div className="text-5xl font-bold text-white mb-2 tracking-tighter">5</div>
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wide">Last: 2d ago</div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Recent Analyses</h2>
        <div className="border border-[#333] bg-black overflow-hidden">
          <table className="min-w-full divide-y divide-[#333]">
            <thead className="bg-[#111]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Competitor</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Analyzed</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Top Pain Point</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="relative px-6 py-4"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="bg-black divide-y divide-[#333]">
              <tr className="hover:bg-[#111] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white uppercase">Salesforce (Demo)</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">Oct 24, 2023</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">Pricing Complexity</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge color="green">Complete</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => {
                      setCurrentAnalysis(INITIAL_ANALYSIS);
                      setAppState(AppState.INSIGHTS);
                    }}
                    className="text-white hover:text-gray-300 underline font-mono text-xs uppercase"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalyzerInput = () => (
    <div className="max-w-2xl mx-auto py-12 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-black border border-[#333] flex items-center justify-center mx-auto mb-8">
          <Search className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tighter uppercase mb-4">Analyze a Competitor</h1>
        <p className="text-gray-400 text-lg font-light">
          Enter a SaaS competitor to scrape reviews and uncover hidden opportunities.
        </p>
      </div>

      <Card className="p-10 border border-[#333] bg-black">
        <div className="space-y-8">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Competitor Name</label>
            <input 
              type="text" 
              className="w-full bg-black border border-[#333] p-4 text-white placeholder-gray-700 focus:outline-none focus:border-white transition-colors font-mono"
              placeholder="E.G. MAILCHIMP, SLACK"
              value={competitorName}
              onChange={(e) => setCompetitorName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Description / Context</label>
            <textarea 
              rows={4}
              className="w-full bg-black border border-[#333] p-4 text-white placeholder-gray-700 focus:outline-none focus:border-white transition-colors font-mono"
              placeholder="DESCRIBE WHAT THEY DO..."
              value={competitorDesc}
              onChange={(e) => setCompetitorDesc(e.target.value)}
            />
          </div>
          
          {error && (
            <div className="bg-red-900/10 text-red-500 p-4 border border-red-900 text-sm flex items-center font-mono">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <Button 
            className="w-full py-5 text-base bg-white text-black hover:bg-gray-200 border-none font-bold uppercase tracking-wide" 
            onClick={handleStartAnalysis}
            disabled={!competitorName || !competitorDesc}
          >
            Start Analysis
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderAnalyzing = () => (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <LoadingSpinner size="lg" />
      <h2 className="text-3xl font-bold text-white mt-12 uppercase tracking-tight">Analyzing {competitorName}</h2>
      <p className="text-gray-500 mt-4 font-mono text-sm uppercase tracking-widest">{analysisStep}</p>
    </div>
  );

  const renderInsights = () => {
    if (!currentAnalysis) return null;

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#333] pb-8">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-4xl font-bold text-white tracking-tighter uppercase">{currentAnalysis.competitorName}</h1>
              <Badge color="blue">Analysis Ready</Badge>
            </div>
            <p className="text-gray-400 font-mono text-sm">DATA_SOURCE: {currentAnalysis.totalReviewsAnalyzed} REVIEWS</p>
          </div>
          <div className="flex space-x-4">
             <Button variant="secondary" onClick={() => setAppState(AppState.DASHBOARD)}>
              CLOSE
            </Button>
            <Button onClick={handleGenerateBlueprint} variant="primary">
              <Sparkles className="w-4 h-4 mr-2" />
              GENERATE BLUEPRINT
            </Button>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-[#333]">
          <div className="p-6 border-r border-[#333] bg-black">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Avg Rating</div>
            <div className="flex items-end">
              <span className="text-4xl font-bold text-white tracking-tighter">{currentAnalysis.averageRating.toFixed(1)}</span>
              <span className="text-gray-600 text-sm mb-1 ml-2 font-mono">/ 5.0</span>
            </div>
          </div>
          <div className="p-6 border-r border-[#333] bg-black">
             <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Primary Complaint</div>
             <div className="text-lg font-bold text-white line-clamp-1 uppercase">
               {currentAnalysis.painPoints[0]?.category || 'N/A'}
             </div>
          </div>
          <div className="p-6 border-r border-[#333] bg-black">
             <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Critical Gaps</div>
             <div className="text-4xl font-bold text-white tracking-tighter">
               {currentAnalysis.featureGaps.filter(g => g.demandLevel === 'Critical').length}
             </div>
          </div>
          <div className="p-6 bg-black">
             <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Opportunity</div>
             <div className="text-4xl font-bold text-white tracking-tighter">HIGH</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Analysis Charts & Details */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <BarChart3 className="w-5 h-5 text-white" />
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Complaint Frequency</h3>
              </div>
              <PainPointChart data={currentAnalysis.painPoints} />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentAnalysis.painPoints.map((pp, idx) => (
                    <Card key={idx} className="p-6 hover:bg-[#111] transition-colors border-[#333]">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-white uppercase">{pp.category}</h4>
                            <Badge color={pp.severity === 'High' ? 'red' : 'yellow'}>{pp.severity}</Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-4 leading-relaxed">{pp.description}</p>
                        <div className="text-xs text-gray-600 font-mono uppercase">Count: {pp.count}</div>
                    </Card>
                ))}
            </div>

            <Card className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <MessageSquare className="w-5 h-5 text-white" />
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Review Highlights</h3>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {currentAnalysis.reviews.slice(0, 5).map((review, idx) => (
                  <div key={idx} className="p-6 bg-[#0a0a0a] border border-[#333]">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex text-white text-xs font-mono">
                        RATING: {review.rating}/5
                      </div>
                      <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">{review.source}</span>
                    </div>
                    <p className="text-sm text-gray-300 italic font-light">"{review.content}"</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Col: Feature Gaps & Actions */}
          <div className="space-y-6">
             <Card className="p-8">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center uppercase tracking-wide">
                    <Zap className="w-5 h-5 mr-3 text-white" /> Feature Gaps
                </h3>
                <div className="space-y-4">
                    {currentAnalysis.featureGaps.map((gap, idx) => (
                        <div key={idx} className="bg-[#0a0a0a] p-5 border border-[#333]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-white uppercase text-sm">{gap.featureName}</span>
                                {gap.demandLevel === 'Critical' && (
                                    <div className="w-2 h-2 bg-red-500 rounded-none"></div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 font-mono">{gap.context}</p>
                        </div>
                    ))}
                </div>
             </Card>

             <Card className="p-8">
                <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wide">Sentiment Summary</h3>
                <p className="text-sm text-gray-400 leading-relaxed border-l-2 border-white pl-6 py-2 font-light">
                    {currentAnalysis.sentimentSummary}
                </p>
             </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderBlueprint = () => {
    if (!blueprint || !currentAnalysis) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
             <div className="flex items-center justify-between border-b border-[#333] pb-6">
                <button 
                  onClick={() => setAppState(AppState.INSIGHTS)}
                  className="flex items-center text-gray-400 hover:text-white transition-colors uppercase font-bold text-xs tracking-widest"
                >
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Analysis
                </button>
                <Button variant="outline" onClick={() => window.print()}>
                    Export PDF
                </Button>
            </div>

            <div className="bg-black border border-[#333] max-w-5xl mx-auto shadow-2xl shadow-white/5">
                {/* Hero Header for Blueprint */}
                <div className="bg-[#0a0a0a] px-12 py-16 border-b border-[#333]">
                    <div className="flex items-center space-x-3 text-gray-500 text-xs font-bold font-mono uppercase tracking-widest mb-8">
                        <Sparkles className="w-4 h-4" />
                        <span>Product Blueprint Generated</span>
                    </div>
                    <h1 className="text-6xl font-bold text-white mb-6 tracking-tighter uppercase">{blueprint.productName}</h1>
                    <p className="text-2xl text-gray-400 font-light">{blueprint.tagline}</p>
                </div>

                <div className="p-12 space-y-16">
                    {/* Value Prop */}
                    <section>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-[#333] pb-2 inline-block">Value Proposition</h3>
                        <p className="text-3xl font-serif text-white leading-relaxed italic">
                            "{blueprint.valueProposition}"
                        </p>
                    </section>

                    {/* Core Features */}
                    <section>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-10 border-b border-[#333] pb-2 inline-block">Core Features & Solutions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {blueprint.coreFeatures.map((feature, idx) => (
                                <div key={idx} className="relative group">
                                    <div className="absolute -left-6 top-0 bottom-0 w-px bg-[#333] group-hover:bg-white transition-colors"></div>
                                    <h4 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">{feature.title}</h4>
                                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">{feature.description}</p>
                                    <div className="inline-flex items-center text-xs text-white font-mono bg-[#111] border border-[#333] px-3 py-1 uppercase">
                                        <TrendingDown className="w-3 h-3 mr-2" />
                                        Fixes: {feature.solvesGap}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Marketing Angles */}
                    <section>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8 border-b border-[#333] pb-2 inline-block">Marketing Angles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#333]">
                            {blueprint.marketingAngles.map((angle, idx) => (
                                <div key={idx} className={`bg-black p-8 border-[#333] text-center flex items-center justify-center ${idx < 2 ? 'md:border-r border-b md:border-b-0' : ''}`}>
                                    <p className="text-sm font-bold text-white uppercase tracking-wide leading-relaxed">{angle}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
  };

  const renderSettings = () => (
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase">Settings</h1>
          <Card className="p-10 border border-[#333]">
              <h3 className="text-xl font-bold text-white mb-8 uppercase tracking-wide">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Email Address</label>
                      <input type="email" value="john@example.com" disabled className="block w-full bg-black border border-[#333] text-gray-400 p-4 font-mono text-sm" />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Current Plan</label>
                      <div className="flex items-center justify-between p-4 border border-[#333] bg-black">
                        <span className="text-white font-bold uppercase">Professional ($49/mo)</span>
                        <span className="text-white text-xs font-bold cursor-pointer hover:underline uppercase tracking-wide">Upgrade</span>
                      </div>
                  </div>
              </div>
          </Card>
           <Card className="p-10 border border-[#333]">
              <h3 className="text-xl font-bold text-white mb-8 uppercase tracking-wide">API Configuration</h3>
              <div className="flex items-center space-x-3 text-sm text-white bg-[#111] p-6 border border-[#333]">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-mono uppercase">Gemini API Key Active</span>
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