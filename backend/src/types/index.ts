import { Request } from 'express';
import { User, CV, Vote } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface CVWithRelations extends CV {
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  votes: Vote[];
  _count?: { votes: number };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CVAnalysisResult {
  score: number;
  issues: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export interface CVImprovementResult {
  improvedText: string;
  structuredCV: {
    personalInfo: Record<string, string>;
    summary: string;
    experience: Array<{
      title: string;
      company: string;
      duration: string;
      achievements: string[];
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
    skills: string[];
  };
  analysis: CVAnalysisResult;
}

export interface AIJobData {
  cvId: string;
  userId: string;
  targetJob?: string;
  targetIndustry?: string;
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
}
