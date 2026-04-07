export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  isPremium: boolean;
  nationality?: string;
  defaultTargetJob?: string;
  defaultTargetIndustry?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface CV {
  id: string;
  userId: string;
  title: string;
  originalPdfUrl: string;
  improvedPdfUrl?: string;
  improvedJson?: CVStructured;
  targetJob?: string;
  targetIndustry?: string;
  analysisResult?: CVAnalysis;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  isPublic: boolean;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'username' | 'name' | 'avatarUrl'>;
  hasVoted?: boolean;
  _count?: { votes: number };
}

export interface CVAnalysis {
  score: number;
  issues: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export interface CVStructured {
  personalInfo: Record<string, string>;
  summary: string;
  experience: Array<{ title: string; company: string; duration: string; achievements: string[] }>;
  education: Array<{ degree: string; institution: string; year: string }>;
  skills: string[];
}
