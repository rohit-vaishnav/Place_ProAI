import { apiRequest } from "./client";

export interface ResumeAnalysisResult {
  atsScore: number;
  resumeScore: number;
  readinessRating: string;
  skillGapAnalysis: {
    detectedSkills: string[];
    missingCriticalSkills: string[];
    goodToHaveMissing: string[];
  };
  improvementSuggestions: {
    formatting: string[];
    keywords: string[];
    experienceImpact: string[];
  };
  industryReadinessSummary: string;
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  conceptsTested: string;
}

export interface InterviewEvaluation {
  totalScore: number;
  grade: string;
  readinessVerdict: string;
  strengths: string[];
  weaknesses: string[];
  detailedQnaFeedback: {
    questionId: number;
    question: string;
    candidateAnswer: string;
    score: number;
    pros: string;
    cons: string;
    suggestedExcellentModelAnswer: string;
  }[];
  actionableTips: string[];
}

export interface CandidateRanking {
  rank: number;
  name: string;
  matchScore: number;
  keyReason: string;
  recommendedRoles: string[];
}

export async function analyzeResume(payload: {
  resumeText: string;
  jobDescription?: string;
  candidateCoreInfo?: Record<string, unknown>;
}): Promise<ResumeAnalysisResult> {
  return apiRequest<ResumeAnalysisResult>("/ai/analyze-resume", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function sendChatMessage(payload: {
  messages: ChatMessage[];
  userRole?: string;
  currentTab?: string;
}): Promise<{ content: string }> {
  return apiRequest<{ content: string }>("/ai/chatbot", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function generateInterviewQuestions(payload: {
  jobTitle: string;
  jobDescription: string;
  roundType: string;
}): Promise<InterviewQuestion[]> {
  return apiRequest<InterviewQuestion[]>("/ai/mock-interview/generate-questions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function evaluateInterview(payload: {
  jobTitle: string;
  roundType: string;
  qnas: { question: string; answer: string }[];
}): Promise<InterviewEvaluation> {
  return apiRequest<InterviewEvaluation>("/ai/mock-interview/evaluate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function rankCandidates(payload: {
  jobRequirements: string;
  candidates: Record<string, unknown>[];
}): Promise<CandidateRanking[]> {
  return apiRequest<CandidateRanking[]>("/ai/rank-candidates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
