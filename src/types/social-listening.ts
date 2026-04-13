// ============================================================================
// Social Listening Agent - Types for Frávega
// ============================================================================

export type Platform = 'twitter' | 'instagram' | 'tiktok' | 'youtube' | 'news' | 'blogs';

export type SentimentScore = 'muy_positivo' | 'positivo' | 'neutro' | 'negativo' | 'muy_negativo';

export interface SocialMention {
  id: string;
  platform: Platform;
  author: string;
  authorFollowers?: number;
  content: string;
  url: string;
  timestamp: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views?: number;
  };
  sentiment?: SentimentScore;
  topics?: string[];
  reach?: number;
  mediaUrls?: string[];
}

export interface TrendingTopic {
  topic: string;
  mentions: number;
  sentiment: SentimentScore;
  velocity: number; // rate of change
  platforms: Platform[];
  peakTime: string;
  relatedTerms: string[];
}

export interface CompetitorMention {
  competitor: string;
  mentions: number;
  sentiment: SentimentScore;
  shareOfVoice: number; // percentage
  topTopics: string[];
}

export interface CrisisAlert {
  id: string;
  severity: 'baja' | 'media' | 'alta' | 'critica';
  topic: string;
  description: string;
  mentionCount: number;
  sentimentTrend: 'mejorando' | 'estable' | 'empeorando';
  sourcePlatforms: Platform[];
  suggestedActions: string[];
  firstDetected: string;
}

export interface InfluencerInsight {
  name: string;
  platform: Platform;
  followers: number;
  engagementRate: number;
  sentiment: SentimentScore;
  recentMentions: number;
  impactScore: number;
  topContent: string;
}

export interface PlatformMetrics {
  platform: Platform;
  totalMentions: number;
  sentimentBreakdown: Record<SentimentScore, number>;
  topHashtags: string[];
  peakHours: string[];
  engagementRate: number;
  reachEstimate: number;
}

export interface SocialListeningReport {
  id: string;
  generatedAt: string;
  period: {
    from: string;
    to: string;
  };
  brand: string;
  executiveSummary: string;
  overallSentiment: {
    score: SentimentScore;
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
    trend: 'mejorando' | 'estable' | 'empeorando';
  };
  platformMetrics: PlatformMetrics[];
  trendingTopics: TrendingTopic[];
  competitorAnalysis: CompetitorMention[];
  crisisAlerts: CrisisAlert[];
  influencerInsights: InfluencerInsight[];
  topMentions: SocialMention[];
  recommendations: string[];
  rawAnalysis: string;
}

export interface AgentConfig {
  brand: string;
  competitors: string[];
  keywords: string[];
  platforms: Platform[];
  language: string;
  reportDepth: 'resumen' | 'detallado' | 'exhaustivo';
  includeCompetitors: boolean;
  includeCrisisDetection: boolean;
  includeInfluencers: boolean;
}

export interface SourceFetchResult {
  platform: Platform;
  mentions: SocialMention[];
  fetchedAt: string;
  success: boolean;
  error?: string;
}

export interface AgentStep {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  detail?: string;
  timestamp: string;
}

export interface AgentExecution {
  id: string;
  config: AgentConfig;
  steps: AgentStep[];
  status: 'running' | 'completed' | 'error';
  report?: SocialListeningReport;
  startedAt: string;
  completedAt?: string;
}
