import React, { useState, useEffect } from "react";
import { 
  User, BookOpen, Brain, MessageSquare, Briefcase, FileCheck, CheckCircle2, 
  Plus, Trash2, Send, Play, Sparkles, Award, ArrowUpRight, Check, X, HelpCircle, FileText
} from "lucide-react";
import { StudentProfile, Job, Application, MockInterviewResult, ChatMessage } from "../types";
import BorderGlow from "./BorderGlow";
import ShimmerButton from "./ShimmerButton";
import * as aiApi from "../api/ai";
import { ApiError } from "../api/client";

interface StudentPortalProps {
  profile: StudentProfile;
  jobs: Job[];
  applications: Application[];
  mockInterviews: MockInterviewResult[];
  onUpdateProfile: (updated: StudentProfile) => void;
  onApplyJob: (jobId: string) => void;
  onSaveMockResult: (result: MockInterviewResult) => void;
  onRequestVerification?: () => void | Promise<void>;
}

export default function StudentPortal({
  profile,
  jobs,
  applications,
  mockInterviews,
  onUpdateProfile,
  onApplyJob,
  onSaveMockResult,
  onRequestVerification
}: StudentPortalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "resume-analyzer" | "interview" | "chatbot" | "jobs">("profile");

  // Profile forms
  const [editingName, setEditingName] = useState(profile.name);
  const [editingPhone, setEditingPhone] = useState(profile.phone);
  const [editingLinkedin, setEditingLinkedin] = useState(profile.linkedin);
  const [editingGithub, setEditingGithub] = useState(profile.github);
  const [editingSkill, setEditingSkill] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>(profile.skills);
  const [degree, setDegree] = useState(profile.academic.degree);
  const [major, setMajor] = useState(profile.academic.major);
  const [graduationYear, setGraduationYear] = useState(profile.academic.graduationYear);
  const [cgpa, setCgpa] = useState(profile.academic.cgpa);
  
  // Custom project adder
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectTech, setProjectTech] = useState("");
  const [projectsList, setProjectsList] = useState(profile.projects);

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Resume analysis state
  const [resumeTextInput, setResumeTextInput] = useState(profile.resumeText || "");
  const [targetJobRole, setTargetJobRole] = useState("React Front-End Developer Intern");
  const [targetJobDesc, setTargetJobDesc] = useState("Required hands-on training with React, vanilla Javascript, state hooks, CSS grid/flex, styling frameworks like Tailwind, and version control.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Chatbot states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      content: "Hello! I am your AI Career Assistant. I can help you with campus placement tips, mock interview roadmaps, resume feedback, and learning guides. Ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);

  // Mock interview states
  const [interviewRoleTitle, setInterviewRoleTitle] = useState("Software Development Intern");
  const [interviewRoleDesc, setInterviewRoleDesc] = useState("Good grasp of programming concepts (such as arrays, loops, OOP) and comfortable drafting modular functions.");
  const [interviewRound, setInterviewRound] = useState<"Technical" | "HR" | "Behavioral">("Technical");
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<{ id: number; question: string; conceptsTested: string }[]>([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(-1);
  const [answersMap, setAnswersMap] = useState<Record<number, string>>({});
  const [interviewReport, setInterviewReport] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Sync profile edits if profile prop changes
  useEffect(() => {
    setEditingName(profile.name);
    setEditingPhone(profile.phone);
    setEditingLinkedin(profile.linkedin);
    setEditingGithub(profile.github);
    setSkillsList(profile.skills);
    setProjectsList(profile.projects);
    setDegree(profile.academic.degree);
    setMajor(profile.academic.major);
    setGraduationYear(profile.academic.graduationYear);
    setGradgpa(profile.academic.cgpa);
  }, [profile]);

  function setGradgpa(v: string) {
    setCgpa(v);
  }

  // Handle saving personal details
  const handleSaveProfile = () => {
    setIsSavingProfile(true);
    setTimeout(() => {
      const updated: StudentProfile = {
        ...profile,
        name: editingName,
        phone: editingPhone,
        linkedin: editingLinkedin,
        github: editingGithub,
        skills: skillsList,
        projects: projectsList,
        academic: {
          degree,
          major,
          institution: "State Engineering College",
          graduationYear,
          cgpa
        }
      };
      onUpdateProfile(updated);
      setIsSavingProfile(false);
    }, 600);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSkill.trim() && !skillsList.includes(editingSkill.trim())) {
      setSkillsList([...skillsList, editingSkill.trim()]);
      setEditingSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsList(skillsList.filter(s => s !== skill));
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim() && projectDesc.trim()) {
      setProjectsList([
        ...projectsList,
        { name: projectName.trim(), desc: projectDesc.trim(), tech: projectTech.trim() }
      ]);
      setProjectName("");
      setProjectDesc("");
      setProjectTech("");
    }
  };

  const handleRemoveProject = (index: number) => {
    setProjectsList(projectsList.filter((_, idx) => idx !== index));
  };

  const triggerVerificationRequest = async () => {
    if (onRequestVerification) {
      await onRequestVerification();
      return;
    }
    onUpdateProfile({ ...profile, verificationStatus: "Pending" });
  };

  // ----------------------------------------------------
  // RESUME ANALYZER ACTION
  // ----------------------------------------------------
  const handleAnalyzeResume = async () => {
    if (!resumeTextInput.trim()) return;
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const data = await aiApi.analyzeResume({
        resumeText: resumeTextInput,
        jobDescription: `${targetJobRole}: ${targetJobDesc}`,
        candidateCoreInfo: { skills: skillsList, degree, major, cgpa },
      });
      setAnalysisResult(data);

      if (data.atsScore) {
        onUpdateProfile({
          ...profile,
          atsScore: data.atsScore,
          resumeScore: data.resumeScore || data.atsScore,
          readinessScore: data.atsScore + 4,
          resumeText: resumeTextInput,
        });
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Resume analysis failed. Please try again.";
      setAiError(msg);
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ----------------------------------------------------
  // CAREER ASSISTANT CHAT ACTION
  // ----------------------------------------------------
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatSending(true);
    setAiError(null);

    try {
      const bodyMessages = [...chatMessages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const data = await aiApi.sendChatMessage({
        messages: bodyMessages,
        userRole: "student",
        currentTab: activeTab,
      });

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Chat failed. Please try again.";
      setAiError(msg);
      console.error(err);
    } finally {
      setIsChatSending(false);
    }
  };

  // ----------------------------------------------------
  // MOCK INTERVIEW TERMINAL
  // ----------------------------------------------------
  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);
    setInterviewQuestions([]);
    setAnswersMap({});
    setActiveQuestionIdx(-1);
    setInterviewReport(null);
    setAiError(null);
    try {
      const data = await aiApi.generateInterviewQuestions({
        jobTitle: interviewRoleTitle,
        jobDescription: interviewRoleDesc,
        roundType: interviewRound,
      });
      if (Array.isArray(data)) {
        setInterviewQuestions(data);
        setActiveQuestionIdx(0);
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to generate questions.";
      setAiError(msg);
      console.error(err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleNextQuestion = () => {
    if (activeQuestionIdx < interviewQuestions.length - 1) {
      setActiveQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx(prev => prev - 1);
    }
  };

  const handleAnswerSubmit = (qId: number, answerText: string) => {
    setAnswersMap(prev => ({
      ...prev,
      [qId]: answerText
    }));
  };

  const handleEvaluateMock = async () => {
    setIsEvaluating(true);
    setAiError(null);
    try {
      const formattedQnas = interviewQuestions.map((q) => ({
        question: q.question,
        answer: answersMap[q.id] || "",
      }));

      const data = await aiApi.evaluateInterview({
        jobTitle: interviewRoleTitle,
        roundType: interviewRound,
        qnas: formattedQnas,
      });
      setInterviewReport(data);

      // Save to main app state
      const mockResult: MockInterviewResult = {
        id: "mock_res_" + Date.now(),
        studentId: profile.id,
        studentName: profile.name,
        jobTitle: interviewRoleTitle,
        roundType: interviewRound,
        totalScore: data.totalScore,
        grade: data.grade,
        verdict: data.readinessVerdict,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        detailedQnaFeedback: data.detailedQnaFeedback || [],
        actionableTips: data.actionableTips || []
      };
      
      onSaveMockResult(mockResult);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Interview evaluation failed.";
      setAiError(msg);
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {aiError && (
        <div className="lg:col-span-12 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center justify-between">
          <span>{aiError}</span>
          <button onClick={() => setAiError(null)} className="text-red-300 hover:text-red-100 ml-4">✕</button>
        </div>
      )}

      {/* Mini Profile Summary Bar (LHS) */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="placement-card p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center text-emerald-400 font-serif text-3xl mb-4 border-2 border-emerald-500/30">
            {profile.name.charAt(0)}
          </div>
          <h3 className="font-serif text-lg text-theme-primary font-semibold">{profile.name}</h3>
          <p className="text-xs text-theme-muted mb-2">{profile.email}</p>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Placement Candidate
          </span>
          
          <div className="w-full mt-4 pt-4 border-t border-neutral-100 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">Status</span>
              {profile.verificationStatus === "Verified" ? (
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              ) : profile.verificationStatus === "Pending" ? (
                <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium border border-amber-200 animate-pulse">
                  ● Reviewing
                </span>
              ) : profile.verificationStatus === "Rejected" ? (
                <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium border border-red-200">
                  ⚠️ Action Req.
                </span>
              ) : (
                <span className="text-neutral-400">Unsubmitted</span>
              )}
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">ATS Resume Score</span>
              <span className="font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-700 font-bold">{profile.atsScore ? `${profile.atsScore}/100` : "Audit Needed"}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">Academic CGPA</span>
              <span className="font-medium text-slate-700">{profile.academic.cgpa} / 10</span>
            </div>
          </div>
        </div>

        {/* Navigation Sidebar */}
        <div className="placement-card p-3 flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "profile" 
              ? "bg-emerald-500/15 text-emerald-300 border-l-4 border-emerald-500" 
              : "text-theme-secondary hover:bg-theme-elevated"
            }`}
          >
            <User className="w-4 h-4" /> Profile Management
          </button>
          <button
            onClick={() => setActiveTab("resume-analyzer")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "resume-analyzer" 
              ? "bg-emerald-500/15 text-emerald-300 border-l-4 border-emerald-500" 
              : "text-theme-secondary hover:bg-theme-elevated"
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" /> AI Resume Analyzer
          </button>
          <button
            onClick={() => setActiveTab("interview")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "interview" 
              ? "bg-emerald-500/15 text-emerald-300 border-l-4 border-emerald-500" 
              : "text-theme-secondary hover:bg-theme-elevated"
            }`}
          >
            <Brain className="w-4 h-4 text-indigo-600" /> AI Mock Interview
          </button>
          <button
            onClick={() => setActiveTab("chatbot")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "chatbot" 
              ? "bg-emerald-500/15 text-emerald-300 border-l-4 border-emerald-500" 
              : "text-theme-secondary hover:bg-theme-elevated"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-600" /> AI Career Chatbot
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "jobs" 
              ? "bg-emerald-500/15 text-emerald-300 border-l-4 border-emerald-500" 
              : "text-theme-secondary hover:bg-theme-elevated"
            }`}
          >
            <Briefcase className="w-4 h-4 text-amber-600" /> Job & Internships
          </button>
        </div>
      </div>

      {/* Main Panel Column */}
      <div className="lg:col-span-9 flex flex-col gap-6">

        {/* Student Placement Welcome Banner */}
        <div className="placement-card p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border-emerald-500/20">
          <div>
            <h2 className="font-serif text-lg font-bold text-theme-primary">Welcome, {profile.name.split(" ")[0]}!</h2>
            <p className="text-xs text-theme-muted mt-1 max-w-lg">
              Your placement dashboard — build your profile, analyze your resume with Groq AI, practice mock interviews, and apply to campus drives.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="text-center px-4 py-2 bg-theme-elevated rounded-xl border border-theme">
              <span className="text-lg font-bold text-emerald-400">{profile.atsScore || "—"}</span>
              <p className="text-[9px] text-theme-muted uppercase tracking-wider">ATS Score</p>
            </div>
            <div className="text-center px-4 py-2 bg-theme-elevated rounded-xl border border-theme">
              <span className="text-lg font-bold text-indigo-400">{applications.length}</span>
              <p className="text-[9px] text-theme-muted uppercase tracking-wider">Applications</p>
            </div>
          </div>
        </div>

        {/* WARNING BAR FOR UNVERIFIED STUDENTS WHO NEED ACCESS */}
        {profile.verificationStatus !== "Verified" && activeTab === "jobs" && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">⚠️</span>
              <div>
                <h4 className="font-bold text-amber-800 text-sm">Lock Screen: Placement Officer Verification Required</h4>
                <p className="text-xs text-amber-900 mt-1">
                  Only College-Verified students are legally permitted to apply to off-campus corporate placements. Complete your profile details and click "Submit Verification Request".
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab("profile");
                triggerVerificationRequest();
              }}
              disabled={profile.verificationStatus === "Pending"}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap self-start md:self-auto transition disabled:opacity-50"
            >
              {profile.verificationStatus === "Pending" ? "Review Pending" : "Submit Request Now"}
            </button>
          </div>
        )}

        {/* TAB CONTENT: PROFILE */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/50 shadow-sm flex flex-col gap-6">
            <div className="border-b border-neutral-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-800">Student Profile Builder</h2>
                <p className="text-xs text-neutral-500 mt-1">Please ensure your qualifications are updated accurately prior to seeking placement verification reviews.</p>
              </div>
              
              <div className="flex gap-2">
                {profile.verificationStatus === "Unsubmitted" && (
                  <button
                    onClick={triggerVerificationRequest}
                    className="px-4 py-2 bg-[#E5EEE4] border border-[#A5C89E] hover:bg-emerald-50 text-slate-800 rounded-xl text-xs font-semibold transition"
                  >
                    Request College Verification
                  </button>
                )}
                <ShimmerButton
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="px-5 py-2 !h-9 text-xs"
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </ShimmerButton>
              </div>
            </div>

            {/* Verification status warnings */}
            {profile.verificationRemarks && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-xs text-red-800">
                <strong>Officer Feedback:</strong> {profile.verificationRemarks}
              </div>
            )}

            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white transition"
                />
              </div>
              
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingPhone}
                  onChange={e => setEditingPhone(e.target.value)}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={editingLinkedin}
                  onChange={e => setEditingLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/..."
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">GitHub URL</label>
                <input
                  type="text"
                  value={editingGithub}
                  onChange={e => setEditingGithub(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Academic Row */}
            <h3 className="font-serif text-md font-bold text-slate-800 pt-4 border-t border-neutral-100">Academic Background</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">Degree</label>
                <input
                  type="text"
                  value={degree}
                  onChange={e => setDegree(e.target.value)}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">Major / Branch</label>
                <input
                  type="text"
                  value={major}
                  onChange={e => setMajor(e.target.value)}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">Graduation Year</label>
                <input
                  type="text"
                  value={graduationYear}
                  onChange={e => setGraduationYear(e.target.value)}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">Current CGPA</label>
                <input
                  type="text"
                  value={cgpa}
                  onChange={e => setCgpa(e.target.value)}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3 font-mono"
                />
              </div>
            </div>

            {/* Skills manager */}
            <h3 className="font-serif text-md font-bold text-slate-800 pt-4 border-t border-neutral-100">Key Technical Skills</h3>
            <div className="flex flex-col gap-4">
              <form onSubmit={handleAddSkill} className="flex gap-2">
                <input
                  type="text"
                  value={editingSkill}
                  onChange={e => setEditingSkill(e.target.value)}
                  placeholder="E.g. AWS Cloud, NestJS, MySQL"
                  className="flex-1 text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3 outline-none focus:border-emerald-400 focus:bg-white transition"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-800 text-white hover:bg-neutral-900 rounded-xl text-xs font-semibold transition"
                >
                  Add Skill
                </button>
              </form>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, index) => (
                  <span key={index} className="bg-neutral-100/80 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 flex items-center gap-1.5 hover:bg-neutral-200 hover:text-neutral-950 transition">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-neutral-400 hover:text-red-500 font-bold">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Projects manager */}
            <h3 className="font-serif text-md font-bold text-slate-800 pt-4 border-t border-neutral-100">Academic & Self-Taught Projects</h3>
            <div className="flex flex-col gap-6">
              <form onSubmit={handleAddProject} className="bg-neutral-50/50 p-4 border border-neutral-200/50 rounded-xl flex flex-col gap-3">
                <h4 className="text-xs font-bold text-[#2D3748]">Add New Project Detail</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="Project Name"
                    className="text-xs bg-white border border-neutral-200 rounded-lg p-2"
                  />
                  <input
                    type="text"
                    value={projectTech}
                    onChange={e => setProjectTech(e.target.value)}
                    placeholder="Technologies Used (e.g. React, Nest, PostgreSQL)"
                    className="text-xs bg-white border border-neutral-200 rounded-lg p-2"
                  />
                </div>
                <textarea
                  value={projectDesc}
                  onChange={e => setProjectDesc(e.target.value)}
                  placeholder="Enter a brief description of project goals, outcome metrics..."
                  rows={2}
                  className="text-xs bg-white border border-neutral-200 rounded-lg p-2 resize-none"
                />
                <button
                  type="submit"
                  className="self-end px-3 py-1.5 bg-[#A5C89E] hover:bg-[#9CAB84] text-white rounded-lg text-xs font-semibold transition"
                >
                  Append Project
                </button>
              </form>

              <div className="grid grid-cols-1 gap-3">
                {projectsList.map((p, index) => (
                  <div key={index} className="p-4 border border-neutral-200 rounded-xl relative flex justify-between items-start bg-neutral-50/20 hover:bg-neutral-50/60 transition">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        {p.name}
                        {p.tech && <span className="font-mono text-[10px] bg-[#E5EEE4] text-slate-700 border border-neutral-200 py-0.5 px-1.5 rounded">{p.tech}</span>}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-1">{p.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(index)}
                      className="text-neutral-400 hover:text-red-500 transition ml-2 self-start"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: AI RESUME ANALYZER */}
        {activeTab === "resume-analyzer" && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/50 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" /> AI ATS Resume Analyzer
              </h2>
              <p className="text-xs text-neutral-500 mt-1">Audit your resume matching dynamic industry roles. Get immediate score diagnostics, spot missing critical skills, and review automated formatting fixes.</p>
            </div>

            {/* Core configuration parameters */}
            <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-600 block mb-1">Target Role Title</label>
                <input
                  type="text"
                  value={targetJobRole}
                  onChange={e => setTargetJobRole(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-200 rounded-xl p-3"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-600 block mb-1">Required Skills Guidelines / Job Description</label>
                <textarea
                  value={targetJobDesc}
                  onChange={e => setTargetJobDesc(e.target.value)}
                  rows={2}
                  className="w-full text-xs bg-white border border-neutral-200 rounded-xl p-3 resize-none"
                />
              </div>
            </div>

            {/* Resume Text Input Area */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Copy Your Full Resume Content (Paste Text)</label>
              <textarea
                value={resumeTextInput}
                onChange={e => setResumeTextInput(e.target.value)}
                placeholder="PRO TIP: Export your resume PDF to text and paste absolutely all details here..."
                rows={8}
                className="w-full text-xs bg-white border border-neutral-200 rounded-2xl p-4 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
              />
            </div>

            <ShimmerButton
              onClick={handleAnalyzeResume}
              disabled={isAnalyzing || !resumeTextInput.trim()}
              className="w-full py-3"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Corporate ATS Crawler is Parsing... Please Wait
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Run AI ATS Audit & Screen Resume
                </span>
              )}
            </ShimmerButton>

            {/* ANALYSIS RESULT DISPLAY */}
            {analysisResult && (
              <div className="mt-4 pt-6 border-t border-neutral-100 flex flex-col gap-6">
                {/* Score panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider mb-2">ATS Score</span>
                    <div className="text-4xl font-mono font-extrabold text-emerald-900">{analysisResult.atsScore}%</div>
                    <span className="text-[10px] text-emerald-700 mt-2">Compatible with modern scanners</span>
                  </div>

                  <div className="bg-neutral-100 border border-neutral-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-neutral-600 font-bold uppercase tracking-wider mb-2">Resume Score</span>
                    <div className="text-4xl font-mono font-extrabold text-neutral-800">{analysisResult.resumeScore}%</div>
                    <span className="text-[10px] text-neutral-500 mt-2">Evaluation of content phrasing</span>
                  </div>

                  <div className="bg-amber-50 border border-[#A5C89E] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-amber-900 font-bold uppercase tracking-wider mb-2">Readiness verdict</span>
                    <div className="text-xl font-bold text-amber-800">{analysisResult.readinessRating}</div>
                    <span className="text-[10px] text-amber-700 mt-2">Matching standard parameters</span>
                  </div>
                </div>

                {/* Industry summary description */}
                <div className="p-4 bg-[#E5EEE4] border border-[#A5C89E] rounded-xl">
                  <h4 className="text-xs font-bold text-slate-800 mb-1">AI Industry Placement Brief</h4>
                  <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">{analysisResult.industryReadinessSummary}</p>
                </div>

                {/* Skill gap analysis lists */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white border border-neutral-200 rounded-xl">
                    <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Detected Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.skillGapAnalysis?.detectedSkills?.map((s: string, i: number) => (
                        <span key={i} className="bg-emerald-50 text-[10px] py-1 px-2 rounded-md font-medium text-emerald-700">{s}</span>
                      )) || <span className="text-neutral-400 text-xs text-center w-full">---</span>}
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-neutral-200 rounded-xl">
                    <h4 className="text-xs font-bold text-red-600 flex items-center gap-1.5 mb-3">
                      ⚠️ Missing Critical Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.skillGapAnalysis?.missingCriticalSkills?.map((s: string, i: number) => (
                        <span key={i} className="bg-red-50 text-[10px] py-1 px-2 rounded-md font-medium text-red-700">{s}</span>
                      )) || <span className="text-neutral-400 text-xs text-center w-full">---</span>}
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-neutral-200 rounded-xl">
                    <h4 className="text-xs font-bold text-blue-600 flex items-center gap-1.5 mb-3">
                      💡 Nice-To-Have Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.skillGapAnalysis?.goodToHaveMissing?.map((s: string, i: number) => (
                        <span key={i} className="bg-blue-50 text-[10px] py-1 px-2 rounded-md font-medium text-blue-700">{s}</span>
                      )) || <span className="text-neutral-400 text-xs text-center w-full">---</span>}
                    </div>
                  </div>
                </div>

                {/* Improvement Suggestions */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-neutral-800">Direct Improvement Checklist</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-semibold text-neutral-700 mb-2">Formatting & Structure</h5>
                      <ul className="list-disc pl-4 flex flex-col gap-1.5 text-[11px] text-neutral-600">
                        {analysisResult.improvementSuggestions?.formatting?.map((f: string, idx: number) => (
                          <li key={idx}>{f}</li>
                        )) || <li>Looks solid</li>}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-xs font-semibold text-neutral-700 mb-2">Keywords Enhancement</h5>
                      <ul className="list-disc pl-4 flex flex-col gap-1.5 text-[11px] text-neutral-600">
                        {analysisResult.improvementSuggestions?.keywords?.map((k: string, idx: number) => (
                          <li key={idx}>{k}</li>
                        )) || <li>Check complete</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: AI MOCK INTERVIEW */}
        {activeTab === "interview" && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/50 shadow-sm flex flex-col gap-6">
            <div className="border-b border-neutral-100 pb-4">
              <h2 className="font-serif text-xl font-bold text-slate-800 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" /> AI Mock Interview Playground
              </h2>
              <p className="text-xs text-neutral-500 mt-1">Simulate real-time corporate technical, behavioral, or HR interview cycles. Solve customized questions, type your answers, and obtain comprehensive grading metrics generated server-side by Groq.</p>
            </div>

            {/* Selection Setup */}
            {activeQuestionIdx === -1 && !interviewReport && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-neutral-600 block mb-1">Target Job Title</label>
                    <input
                      type="text"
                      value={interviewRoleTitle}
                      onChange={e => setInterviewRoleTitle(e.target.value)}
                      placeholder="e.g. Associate Web Architect"
                      className="w-full text-xs bg-neutral-50 border border-neutral-200 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 text-slate-700 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-600 block mb-1">Interview Segment Round</label>
                    <select
                      value={interviewRound}
                      onChange={e => setInterviewRound(e.target.value as any)}
                      className="w-full text-xs bg-neutral-50 border border-neutral-200 p-3 rounded-xl cursor-pointer text-slate-700"
                    >
                      <option value="Technical">Technical Round (Data, Code, Logic)</option>
                      <option value="HR">HR / Leadership Background Round</option>
                      <option value="Behavioral">Behavioral Round (Team Dynamics, Conflict)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-600 block mb-1">Job Details & Tech Guidelines</label>
                  <textarea
                    value={interviewRoleDesc}
                    onChange={e => setInterviewRoleDesc(e.target.value)}
                    rows={2}
                    className="w-full text-xs bg-neutral-50 border border-neutral-200 p-3 rounded-xl resize-none text-slate-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition"
                  />
                </div>

                <div className="pt-2">
                  <ShimmerButton
                    onClick={handleGenerateQuestions}
                    disabled={isGeneratingQuestions}
                    background="linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)" // Indigo styled theme button
                    className="w-full justify-center text-sm py-4 rounded-xl"
                  >
                    {isGeneratingQuestions ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        AI Panelist is Drafting Conceptual Inquiries...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Play className="w-4 h-4" /> Generate AI Mock Interview Questions
                      </span>
                    )}
                  </ShimmerButton>
                </div>
              </div>
            )}

            {/* ACTIVE RUNNING PLAYGROUND */}
            {activeQuestionIdx !== -1 && !interviewReport && (
              <div className="bg-neutral-50/50 rounded-2xl p-4 md:p-6 border border-neutral-200/50 flex flex-col gap-6">
                
                {/* Timeline meter */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Question {activeQuestionIdx + 1} of {interviewQuestions.length}</span>
                  <div className="flex gap-1.5">
                    {interviewQuestions.map((_, idx) => (
                      <span 
                        key={idx} 
                        className={`w-4 h-1.5 rounded-full transition-all duration-300 ${
                          idx === activeQuestionIdx 
                          ? "bg-indigo-600 w-8" 
                          : answersMap[interviewQuestions[idx].id] 
                          ? "bg-indigo-400" 
                          : "bg-neutral-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Question panel */}
                <div className="bg-white border border-indigo-200/50 rounded-2xl p-6 shadow-sm">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded">
                    TESTING FOR: {interviewQuestions[activeQuestionIdx].conceptsTested}
                  </span>
                  <h3 className="text-sm md:text-md text-slate-800 font-bold mt-4 leading-relaxed">
                    {interviewQuestions[activeQuestionIdx].question}
                  </h3>
                </div>

                {/* Response textbox */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-neutral-600">Draft Your Professional Verbal/Technical Response</label>
                  <textarea
                    value={answersMap[interviewQuestions[activeQuestionIdx].id] || ""}
                    onChange={e => handleAnswerSubmit(interviewQuestions[activeQuestionIdx].id, e.target.value)}
                    placeholder="Provide a comprehensive explanation, referencing past academic experiences, coursework, or custom algorithms if relevant..."
                    rows={6}
                    className="w-full text-xs bg-white border border-neutral-200 rounded-2xl p-4 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 font-sans leading-relaxed text-slate-800"
                  />
                  <span className="text-[10px] text-neutral-400 self-end">
                    Word count: {(answersMap[interviewQuestions[activeQuestionIdx].id] || "").trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>

                {/* Question Timeline actions */}
                <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={activeQuestionIdx === 0}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg text-xs disabled:opacity-50 transition"
                  >
                    Back Question
                  </button>

                  {activeQuestionIdx < interviewQuestions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition"
                    >
                      Next Question
                    </button>
                  ) : (
                    <ShimmerButton
                      onClick={handleEvaluateMock}
                      disabled={isEvaluating}
                      background="linear-gradient(135deg, #10B981 0%, #059669 100%)" // Emerald on end-action
                      className="px-5 py-2 !h-9 text-xs"
                    >
                      {isEvaluating ? (
                        <span className="flex items-center gap-1">
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Grading Performance...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <FileCheck className="w-3.5 h-3.5" /> Submit & Run AI Evaluation
                        </span>
                      )}
                    </ShimmerButton>
                  )}
                </div>
              </div>
            )}

            {/* REPORT DISPLAY AREA */}
            {interviewReport && (
              <div className="flex flex-col gap-6 mt-2">
                
                {/* Visual score display banner */}
                <div className="bg-neutral-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div>
                    <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest block mb-1">MOCK ASSESSMENT COMPLETE</span>
                    <h3 className="font-serif text-lg md:text-xl font-bold leading-snug">{interviewRoleTitle} ({interviewRound} Session)</h3>
                    <p className="text-xs text-neutral-400 mt-2 max-w-lg leading-relaxed">{interviewReport.readinessVerdict}</p>
                  </div>

                  <div className="flex items-center gap-6 self-start md:self-auto">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-neutral-400 mb-1">Grade</span>
                      <div className="text-5xl font-serif font-extrabold text-[#A5C89E]">{interviewReport.grade}</div>
                    </div>
                    <div className="w-px h-12 bg-neutral-800" />
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-neutral-400 mb-1">Total Score</span>
                      <div className="text-4xl font-mono font-bold">{interviewReport.totalScore}<span className="text-sm font-normal text-neutral-400">/100</span></div>
                    </div>
                  </div>
                </div>

                {/* Strengths & Weaknesses checklists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <Check className="w-4 h-4 bg-emerald-100 text-emerald-700 rounded-full p-0.5" /> Strengths Demonstrated
                    </h4>
                    <ul className="list-disc pl-4 flex flex-col gap-1.5 text-[11px] text-emerald-950">
                      {interviewReport.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="p-5 bg-red-50/40 border border-red-100 rounded-xl flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                      <X className="w-4 h-4 bg-red-100 text-red-700 rounded-full p-0.5" /> Core Skill Failures & Weakness
                    </h4>
                    <ul className="list-disc pl-4 flex flex-col gap-1.5 text-[11px] text-red-950">
                      {interviewReport.weaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Specific answer grades timeline */}
                <h3 className="font-serif text-md font-bold text-slate-800 pt-4 border-t border-neutral-100">Analytical Question Insights</h3>
                <div className="flex flex-col gap-4">
                  {interviewReport.detailedQnaFeedback?.map((qItem: any, idx: number) => (
                    <div key={idx} className="bg-neutral-50/50 p-5 rounded-2xl border border-neutral-200/50 flex flex-col gap-3 hover:bg-neutral-50 transition">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[11px] font-bold text-neutral-400">INQUIRY {qItem.questionId}</span>
                        <span className="font-mono text-xs font-bold bg-white border border-neutral-200 py-1 px-2.5 rounded-lg text-emerald-700">{qItem.score}/100</span>
                      </div>
                      
                      <p className="text-xs font-bold text-slate-800">Q: {qItem.question}</p>
                      <p className="text-xs italic bg-white/70 border border-neutral-200/30 p-3 rounded-lg text-neutral-600">Your Answer: {qItem.candidateAnswer || "(Left Blank)"}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-1">
                        <div className="bg-emerald-50/30 p-3 rounded-xl">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block mb-1">Pros</span>
                          <span className="text-[11px] text-emerald-950">{qItem.pros}</span>
                        </div>
                        <div className="bg-red-50/20 p-3 rounded-xl">
                          <span className="text-[10px] font-bold text-red-800 uppercase tracking-widest block mb-1">Cons</span>
                          <span className="text-[11px] text-red-950">{qItem.cons}</span>
                        </div>
                      </div>

                      <div className="bg-indigo-50/30 border border-indigo-100/50 p-4 rounded-xl mt-1">
                        <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest block mb-1">Elite Model Answer</span>
                        <p className="text-[11px] text-slate-700 leading-relaxed font-serif">{qItem.suggestedExcellentModelAnswer}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Tips */}
                <div className="bg-indigo-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                  <div className="text-3xl">💡</div>
                  <div>
                    <h4 className="font-bold text-indigo-200 text-xs uppercase tracking-wider">AI Panel Placement Blueprint Recommendations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {interviewReport.actionableTips?.map((tip: string, tIdx: number) => (
                        <div key={tIdx} className="flex gap-2 items-start text-xs text-neutral-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reset button */}
                <button
                  onClick={() => {
                    setInterviewReport(null);
                    setActiveQuestionIdx(-1);
                    setInterviewQuestions([]);
                  }}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-semibold rounded-xl self-center transition"
                >
                  Restart New Interview Session
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: CAREER CHATBOT */}
        {activeTab === "chatbot" && (
          <div className="bg-white rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col h-[520px] overflow-hidden">
            <div className="p-4 md:p-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Placement Career Grounding Assistant</h2>
                  <p className="text-[10px] text-neutral-500">Provides continuous learning maps and placement techniques</p>
                </div>
              </div>
              <HelpCircle className="w-4 h-4 text-neutral-400" />
            </div>

            {/* Scrollable messages area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-neutral-50/20">
              {chatMessages.map((msg, index) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <p className="text-[9px] text-neutral-400 mb-1 px-1">{msg.timestamp}</p>
                  <div 
                    className={`rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.role === 'user' 
                      ? "bg-slate-800 text-white rounded-tr-none" 
                      : "bg-white border border-neutral-200 text-[#2D3748] rounded-tl-none font-serif shadow-sm whitespace-pre-line"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatSending && (
                <div className="flex items-center gap-1.5 bg-white border border-neutral-200 px-3 py-2 rounded-2xl self-start">
                  <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendChatMessage} className="p-4 border-t border-neutral-100 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask e.g. How do I improve my resume? How to introduce myself?"
                className="flex-1 text-xs bg-neutral-50 border border-neutral-200 p-3 rounded-xl focus:bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatSending}
                className="p-3 bg-[#A5C89E] hover:bg-[#9CAB84] text-white rounded-xl transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB CONTENT: ACTIVE PLACEMENTS JOBS LIST */}
        {activeTab === "jobs" && (
          <div className="flex flex-col gap-4">
            
            <div className="bg-white rounded-2xl p-6 border border-neutral-200/50 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-slate-800">Approved Campus Hiring Opportunities</h2>
              <p className="text-xs text-neutral-500 mt-1">Explore current verification-passed vacancies. Verified students can instantly click 'Apply Now' to lock applications onto recruiter files with complete profiles.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {jobs
                .filter(j => j.verificationStatus === "Approved")
                .map(job => {
                  const hasApplied = applications.some(app => app.jobId === job.id && app.studentId === profile.id);
                  const isVerified_user = profile.verificationStatus === "Verified";
                  const btnText = hasApplied ? "Applied Successfully" : "Apply Now";

                  return (
                    <div key={job.id} className="bg-white rounded-2xl p-6 border border-neutral-200/50 hover:border-neutral-300 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-all">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest bg-[#E5EEE4] text-slate-800 px-2 py-0.5 rounded border border-[#A5C89E]">
                            {job.recruiterName}
                          </span>
                          <span className="text-[10px] text-neutral-400">Deadline: {job.deadline}</span>
                        </div>
                        <h3 className="text-sm md:text-md font-bold text-slate-800 leading-snug">{job.title}</h3>
                        <p className="text-xs text-neutral-500 mt-1 max-w-2xl line-clamp-2 leading-relaxed">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-3.5">
                          {job.skills.map((s, sIdx) => (
                            <span key={sIdx} className="bg-neutral-100 text-[10px] text-neutral-700 font-medium py-1 px-2.5 rounded-md">
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-neutral-100 text-xs text-neutral-500">
                          <div>
                            <span className="text-[10px] uppercase block tracking-wider text-neutral-400">Salary Package</span>
                            <span className="font-semibold text-slate-700 mt-0.5 block">{job.salary}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase block tracking-wider text-neutral-400">Location</span>
                            <span className="font-semibold text-slate-700 mt-0.5 block">{job.location}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] uppercase block tracking-wider text-neutral-400">Eligibility</span>
                            <span className="font-semibold text-slate-700 mt-0.5 block truncate">{job.eligibility}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 self-end md:self-auto flex items-center">
                        <button
                          onClick={() => onApplyJob(job.id)}
                          disabled={hasApplied || !isVerified_user}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                            hasApplied 
                            ? "bg-slate-100 text-slate-400 font-normal cursor-default border border-neutral-200" 
                            : isVerified_user 
                            ? "bg-[#A5C89E] hover:bg-[#9CAB84] text-white shadow-md hover:shadow-lg"
                            : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                          }`}
                        >
                          {btnText}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
