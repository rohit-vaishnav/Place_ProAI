export type UserRole = "student" | "recruiter" | "placementOfficer" | "admin";

export interface AcademicInfo {
  degree: string;
  major: string;
  institution: string;
  graduationYear: string;
  cgpa: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  skills: string[];
  projects: { name: string; desc: string; tech: string }[];
  certifications: string[];
  resumeText: string;
  academic: AcademicInfo;
  verificationStatus: "Unsubmitted" | "Pending" | "Verified" | "Rejected";
  verificationRemarks?: string;
  resumeScore: number;
  atsScore: number;
  readinessScore: number;
}

export interface Job {
  id: string;
  recruiterId: string;
  recruiterName: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  salary: string;
  eligibility: string;
  deadline: string;
  verificationStatus: "Pending" | "Approved" | "Rejected";
  verificationRemarks?: string;
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  status: "Applied" | "Shortlisted" | "MockAssigned" | "MockCompleted" | "Selected" | "Rejected";
  appliedDate: string;
  mockInterviewId?: string; // Links to AI Mock evaluation
  interviewScore?: number;
}

export interface MockInterviewResult {
  id: string;
  studentId: string;
  studentName: string;
  jobTitle: string;
  roundType: "Technical" | "HR" | "Behavioral";
  totalScore: number;
  grade: string;
  verdict: string;
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

export interface PlacementDrive {
  id: string;
  companyName: string;
  startDate: string;
  eligibleCourses: string[];
  cgpaCutoff: number;
  registeredCount: number;
  status: "Upcoming" | "Active" | "Completed";
  location: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}
