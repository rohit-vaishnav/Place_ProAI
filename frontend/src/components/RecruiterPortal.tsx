import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, Edit, User, Eye, Briefcase, FileCheck, CheckCircle2, 
  Sparkles, Award, ArrowUpRight, ShieldCheck, Cpu, Database, ChevronRight, X
} from "lucide-react";
import { Job, StudentProfile, Application, MockInterviewResult } from "../types";
import BorderGlow from "./BorderGlow";
import ShimmerButton from "./ShimmerButton";
import * as aiApi from "../api/ai";
import { ApiError } from "../api/client";

interface RecruiterPortalProps {
  jobs: Job[];
  applications: Application[];
  students: StudentProfile[];
  recruiterId: string;
  recruiterName: string;
  onCreateJob: (job: Job) => void;
  onUpdateJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
  onUpdateApplicationStatus: (appId: string, status: any) => void;
}

export default function RecruiterPortal({
  jobs,
  applications,
  students,
  recruiterId,
  recruiterName,
  onCreateJob,
  onUpdateJob,
  onDeleteJob,
  onUpdateApplicationStatus
}: RecruiterPortalProps) {
  const [activeTab, setActiveTab] = useState<"job-list" | "applicants" | "rankings">("job-list");

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsStr, setSkillsStr] = useState("");
  const [location, setLocation] = useState("Bangalore (Onsite)");
  const [salary, setSalary] = useState("₹80,000 / Month");
  const [eligibility, setEligibility] = useState("8.0+ CGPA; B.Tech CSE/IT");
  const [deadline, setDeadline] = useState("2026-07-31");

  // AI Candidate ranking state
  const [rankingRoleId, setRankingRoleId] = useState<string>("");
  const [rankingsList, setRankingsList] = useState<any[]>([]);
  const [isRanking, setIsRanking] = useState(false);

  // Resume inspect view
  const [inspectStudentResume, setInspectStudentResume] = useState<StudentProfile | null>(null);

  // Filter recruiter specific items
  const myJobs = jobs.filter(j => j.recruiterId === recruiterId);

  useEffect(() => {
    if (!rankingRoleId && myJobs.length > 0) {
      setRankingRoleId(myJobs[0].id);
    }
  }, [myJobs, rankingRoleId]);

  const myApplications = applications.filter(app => {
    const job = jobs.find(j => j.id === app.jobId);
    return job && job.recruiterId === recruiterId;
  });

  const handleOpenEdit = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setSkillsStr(job.skills.join(", "));
    setLocation(job.location);
    setSalary(job.salary);
    setEligibility(job.eligibility);
    setDeadline(job.deadline);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingJob(null);
    setTitle("");
    setDescription("");
    setSkillsStr("");
  };

  const handleCreateOrUpdateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const skillsArr = skillsStr.split(",").map(s => s.trim()).filter(Boolean);

    if (editingJob) {
      const updated: Job = {
        ...editingJob,
        title,
        description,
        skills: skillsArr,
        location,
        salary,
        eligibility,
        deadline
      };
      onUpdateJob(updated);
    } else {
      const newJob: Job = {
        id: "job_" + Date.now(),
        recruiterId,
        recruiterName,
        title,
        description,
        skills: skillsArr,
        location,
        salary,
        eligibility,
        deadline,
        verificationStatus: "Pending" // placement officer must approve recruiter jobs
      };
      onCreateJob(newJob);
    }
    handleCloseForm();
  };

  // Run AI candidate ranking for selected target job
  const handleAIRanking = async () => {
    const targetJob = jobs.find(j => j.id === rankingRoleId);
    if (!targetJob) return;

    setIsRanking(true);
    setRankingsList([]);

    // Extract student applicants profiles applying to this job
    const relevantApplicantsApps = applications.filter(app => app.jobId === rankingRoleId);
    const candidatePayloads = relevantApplicantsApps.map(app => {
      const studentObj = students.find(s => s.id === app.studentId);
      return {
        name: studentObj?.name || app.studentName,
        skills: studentObj?.skills || [],
        resumeScore: studentObj?.atsScore || 70,
        interviewScore: app.interviewScore || 75,
        verified: studentObj?.verificationStatus === "Verified",
        gpa: studentObj?.academic.cgpa || "N/A"
      };
    });

    if (candidatePayloads.length === 0) {
      setIsRanking(false);
      alert("No student has applied to this placement yet. Create mock applicants or apply as student first!");
      return;
    }

    try {
      const data = await aiApi.rankCandidates({
        jobRequirements: `${targetJob.title}: ${targetJob.description}. Skills: ${targetJob.skills.join(", ")}`,
        candidates: candidatePayloads,
      });
      if (Array.isArray(data)) {
        setRankingsList(data);
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Candidate ranking failed.";
      alert(msg);
      console.error(err);
    } finally {
      setIsRanking(false);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LHS Menu Column */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/50 shadow-sm flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#E5EEE4] rounded-2xl flex items-center justify-center text-[#2D3748] font-serif font-black text-2xl mb-4 shadow-[0_4px_12px_rgba(192,225,210,0.3)]">
            {recruiterName.charAt(0)}
          </div>
          <h3 className="font-serif text-lg text-slate-800 font-bold">{recruiterName}</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Corporate Talent Partner</p>

          <div className="w-full mt-4 pt-4 border-t border-neutral-100 flex flex-col gap-3 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">Active Listings</span>
              <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-100 font-mono font-bold">{myJobs.length}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">Total Applicants</span>
              <span className="bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full font-mono font-bold">{myApplications.length}</span>
            </div>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="bg-white rounded-2xl p-3 border border-neutral-200/50 shadow-sm flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("job-list")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "job-list" 
              ? "bg-[#E5EEE4] text-[#2D3748] border-l-4 border-[#A5C89E]" 
              : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-600" /> My Placement Postings
          </button>
          <button
            onClick={() => setActiveTab("applicants")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "applicants" 
              ? "bg-[#E5EEE4] text-[#2D3748] border-l-4 border-[#A5C89E]" 
              : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <User className="w-4 h-4 text-amber-600" /> Applicant Management
          </button>
          <button
            onClick={() => setActiveTab("rankings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "rankings" 
              ? "bg-[#E5EEE4] text-[#2D3748] border-l-4 border-[#A5C89E]" 
              : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" /> AI Candidate Ranking
          </button>
        </div>
      </div>

      {/* Main Panel Content (RHS) */}
      <div className="lg:col-span-9 flex flex-col gap-6">

        {/* TAB 1: PLACEMENT LISTINGS */}
        {activeTab === "job-list" && (
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-slate-800">Job Placement Opportunities Console</h2>
                <p className="text-xs text-neutral-500 mt-1">Manage corporate internship openings. Please note, every listed role must undergo official verification by the campus Placement Officer before it is displayed to active students.</p>
              </div>

              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" /> Create Placement Role
                </button>
              )}
            </div>

            {/* CREATE/UPDATE MODAL FORM */}
            {showAddForm && (
              <form onSubmit={handleCreateOrUpdateJob} className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-md flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <h3 className="font-serif text-sm font-bold text-slate-800">{editingJob ? "Configure Vacancy Posting" : "Initiate Placement Requirement Draft"}</h3>
                  <button type="button" onClick={handleCloseForm} className="text-neutral-400 hover:text-neutral-700 font-bold text-lg">×</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Corporate Role Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Associate Backend Specialist"
                      className="w-full text-xs border border-neutral-200 p-3 rounded-lg text-slate-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Target Skill Stack (Comma Separated)</label>
                    <input
                      type="text"
                      value={skillsStr}
                      onChange={e => setSkillsStr(e.target.value)}
                      placeholder="e.g. Java, Docker, PostgreSQL"
                      className="w-full text-xs border border-neutral-200 p-3 rounded-lg text-slate-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">Full Candidate Description & Critical Outcomes</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Provide goals, metrics, and technologies used..."
                    className="w-full text-xs border border-neutral-200 p-3 rounded-lg text-slate-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Office Location</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full border border-neutral-200 p-2.5 rounded-lg" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Pay Package/Month</label>
                    <input type="text" value={salary} onChange={e => setSalary(e.target.value)} className="w-full border border-neutral-200 p-2.5 rounded-lg" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Eligibility Criteria</label>
                    <input type="text" value={eligibility} onChange={e => setEligibility(e.target.value)} className="w-full border border-neutral-200 p-2.5 rounded-lg" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 block mb-1">Application Deadline</label>
                    <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full border border-neutral-200 p-2.5 rounded-lg" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                  <button type="button" onClick={handleCloseForm} className="px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-semibold">Discard</button>
                  <button type="submit" className="px-5 py-2 bg-[#A5C89E] hover:bg-[#9CAB84] text-white rounded-lg text-xs font-bold shadow-sm">Save Placement Post</button>
                </div>
              </form>
            )}

            {/* LIST OF ROLES */}
            <div className="grid grid-cols-1 gap-4">
              {myJobs.map(job => (
                <div key={job.id} className="bg-white rounded-2xl p-6 border border-neutral-200/50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-neutral-300 transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full border ${
                        job.verificationStatus === "Approved" 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                        : job.verificationStatus === "Rejected"
                        ? "bg-red-50 text-red-800 border-red-100"
                        : "bg-amber-50 text-amber-800 border-amber-100 animate-pulse"
                      }`}>
                        {job.verificationStatus === "Approved" ? "● Visible To Students" : job.verificationStatus === "Rejected" ? "⚠️ Needs Officer Redraft" : "● Verifying by College"}
                      </span>
                      {job.verificationRemarks && <span className="text-[10px] text-red-500 font-bold ml-1">Reason: {job.verificationRemarks}</span>}
                    </div>

                    <h3 className="text-sm md:text-md text-slate-800 font-bold">{job.title}</h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skills.map((s, idx) => (
                        <span key={idx} className="bg-neutral-100 text-[10px] py-1 px-2.5 rounded font-medium text-slate-700">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 self-end md:self-auto shrink-0">
                    <button
                      onClick={() => handleOpenEdit(job)}
                      className="p-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-600 hover:text-slate-800 transition"
                      title="Edit Vacancy"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteJob(job.id)}
                      className="p-2 bg-neutral-50 hover:bg-red-50 border border-neutral-200 hover:border-red-200 rounded-lg text-neutral-400 hover:text-red-600 transition"
                      title="Delete Posting"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {myJobs.length === 0 && (
                <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-neutral-200 font-serif text-neutral-400">
                  No vacancies drafted under your talent corporate key yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: APPLICANTS MANAGEMENT */}
        {activeTab === "applicants" && (
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-800">Job Applicant Administration Deck</h2>
              <p className="text-xs text-neutral-500 mt-1">Review student applications, analyze matching metrics, verify profiles, and assign specialized AI Technical / behavioral rounds.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 uppercase tracking-widest text-[9px] border-b border-neutral-200/60">
                    <th className="p-4 rounded-tl-xl">Student Candidate</th>
                    <th className="p-4">Applied Placement</th>
                    <th className="p-4">ATS Fit Rate</th>
                    <th className="p-4">Mock Status</th>
                    <th className="p-4">College State</th>
                    <th className="p-4">Current Workflow Stage</th>
                    <th className="p-4 rounded-tr-xl text-center">Interactive Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {myApplications.map(app => {
                    const studentObj = students.find(s => s.id === app.studentId);
                    const targetJob = jobs.find(j => j.id === app.jobId);

                    return (
                      <tr key={app.id} className="hover:bg-neutral-50/50 transition">
                        <td className="p-4 font-bold text-[#2D3748]">
                          {app.studentName}
                          <span className="block text-[10px] text-neutral-400 font-normal mt-0.5">{studentObj?.email}</span>
                        </td>
                        <td className="p-4 text-neutral-600 font-serif leading-relaxed line-clamp-1 truncate max-w-[150px]">
                          {targetJob?.title || "Corporate Vacancy"}
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-700">
                          {studentObj?.atsScore ? `${studentObj.atsScore}%` : "Not Screened"}
                        </td>
                        <td className="p-4">
                          {app.interviewScore ? (
                            <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-100">
                              Verified Score: {app.interviewScore}%
                            </span>
                          ) : app.status === "MockAssigned" ? (
                            <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-100 animate-pulse">
                              Mock Pending
                            </span>
                          ) : (
                            <span className="text-neutral-400">Not Assigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          {studentObj?.verificationStatus === "Verified" ? (
                            <span className="bg-emerald-50 text-emerald-700 py-0.5 px-2 rounded-full font-semibold border border-emerald-200">Verified</span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 py-0.5 px-2 rounded-full font-semibold border border-amber-200">Pending College</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] ${
                            app.status === "Selected" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : app.status === "Rejected" 
                            ? "bg-red-100 text-red-800"
                            : app.status === "Shortlisted"
                            ? "bg-[#FFFDCE] text-amber-800"
                            : "bg-neutral-100 text-neutral-600"
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1.5 justify-center">
                            {/* Inspect Resume */}
                            <button
                              onClick={() => {
                                if (studentObj) {
                                  setInspectStudentResume(studentObj);
                                } else {
                                  alert("Candidate data is currently unpopulated.");
                                }
                              }}
                              className="p-1 px-1.5 bg-[#E5EEE4] hover:bg-emerald-100 border border-neutral-200 rounded text-neutral-700 font-medium transition flex items-center gap-1"
                              title="Inspect Qualifications"
                            >
                              <Eye className="w-3.5 h-3.5" /> Resume
                            </button>

                            {/* Assign mock */}
                            {app.status !== "Selected" && app.status !== "Rejected" && (
                              <button
                                onClick={() => onUpdateApplicationStatus(app.id, "MockAssigned")}
                                className="p-1 px-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded text-indigo-700 font-medium transition"
                                title="Force AI Mock Assessment"
                              >
                                Trigger Mock
                              </button>
                            )}

                            {/* Shortlist / Select / Reject controls */}
                            {app.status === "Applied" && (
                              <button
                                onClick={() => onUpdateApplicationStatus(app.id, "Shortlisted")}
                                className="p-1 px-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded text-amber-700 font-medium transition"
                              >
                                Shortlist
                              </button>
                            )}

                            {app.status !== "Selected" && app.status !== "Rejected" && (
                              <>
                                <button
                                  onClick={() => onUpdateApplicationStatus(app.id, "Selected")}
                                  className="p-1 px-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium transition"
                                >
                                  Select
                                </button>
                                <button
                                  onClick={() => onUpdateApplicationStatus(app.id, "Rejected")}
                                  className="p-1 px-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium transition"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {myApplications.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-neutral-400 font-serif">
                        No active student has registered applications on your vacancies yet. Apply first inside the Student Dashboard!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AI CANDIDATE RANKINGS */}
        {activeTab === "rankings" && (
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" /> AI-Powered Candidate Ranking
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Trigger Groq reasoning pipelines to rank submitted student profiles based on cumulative ATS Scores, custom Skills relevance, and Mock Interview evaluations.
              </p>
            </div>

            {/* Config target role */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-50 p-4 border border-neutral-200 rounded-2xl">
              <div className="flex-1 w-full">
                <label className="text-xs font-bold text-neutral-600 block mb-1">Target Hiring Vacancy</label>
                <select
                  value={rankingRoleId}
                  onChange={e => setRankingRoleId(e.target.value)}
                  className="w-full text-xs bg-white border border-neutral-200 p-2.5 rounded-xl cursor-pointer"
                >
                  {myJobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                </select>
              </div>

              <ShimmerButton
                onClick={handleAIRanking}
                disabled={isRanking || myJobs.length === 0}
                background="linear-gradient(135deg, #4F46E5 0%, #302CE9 100%)" // Beautiful dark blue shimmer
                className="py-3 px-6 h-10 text-xs self-end w-full md:w-auto"
              >
                {isRanking ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Evaluating Merit lists...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    Evaluate & Rank Applicants
                  </span>
                )}
              </ShimmerButton>
            </div>

            {/* RESULTS RANKING DISPLAY */}
            {rankingsList.map((c, idx) => (
              <div key={idx} className="p-5 bg-neutral-50/50 border border-neutral-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5 hover:bg-neutral-50 transition border-l-4 border-l-indigo-500">
                <div className="flex items-start gap-4 w-full">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-bold font-serif text-indigo-800 shrink-0 border border-indigo-100">
                    #{c.rank}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      {c.name}
                      <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold border border-emerald-100 py-0.5 px-2 rounded-full">
                        {c.matchScore}% Match Fit
                      </span>
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{c.keyReason}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {c.recommendedRoles?.map((role: string, rIdx: number) => (
                        <span key={rIdx} className="bg-indigo-50 text-[10px] py-0.5 px-2 rounded text-indigo-700 font-medium">{role}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center bg-white border border-neutral-200 p-3 rounded-xl self-end md:self-auto font-mono text-[10px]">
                  <span>Priority Placement Recommendation</span>
                </div>
              </div>
            ))}

            {rankingsList.length === 0 && !isRanking && (
              <div className="text-center p-8 border border-neutral-200 text-neutral-400 text-xs font-serif rounded-xl">
                Configure your target vacancy and run Groq comparative evaluation to populate rankings dynamically.
              </div>
            )}
          </div>
        )}

        {/* RESUME INSPECTOR MODAL STATE */}
        {inspectStudentResume && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-neutral-300 p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                <h3 className="font-serif text-sm font-bold text-indigo-900">Qualifications Inspection Dossier</h3>
                <button onClick={() => setInspectStudentResume(null)} className="p-1 px-1.5 hover:bg-neutral-100 rounded text-neutral-500 font-bold">×</button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#2D3748] mb-1">{inspectStudentResume.name}</h4>
                <p className="text-[10px] text-neutral-400 mb-4">{inspectStudentResume.email} | {inspectStudentResume.phone}</p>
                
                <h5 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-t border-neutral-100 pt-3 mb-2">Academic Index</h5>
                <p className="text-xs text-slate-800">{inspectStudentResume.academic?.degree} in {inspectStudentResume.academic?.major}, graduating {inspectStudentResume.academic?.graduationYear}. Verified Cumulative CGPA: <strong>{inspectStudentResume.academic?.cgpa}/10</strong></p>

                <h5 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-t border-neutral-100 pt-3 mb-2 mt-4">Verified Skill Inventory</h5>
                <div className="flex flex-wrap gap-1 mb-4">
                  {inspectStudentResume.skills?.map((s, idx) => (
                    <span key={idx} className="bg-[#E5EEE4] text-slate-700 text-[10px] font-medium py-1 px-2.5 rounded-md border border-neutral-200">{s}</span>
                  ))}
                </div>

                <h5 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-t border-neutral-100 pt-3 mb-2">Raw Portfolio Phrasings</h5>
                <pre className="text-[11px] font-mono leading-relaxed bg-neutral-50 text-neutral-700 p-4 border border-neutral-200 rounded-xl overflow-x-auto whitespace-pre-wrap max-h-[220px]">
                  {inspectStudentResume.resumeText || "No text-based copy has been uploaded on record."}
                </pre>
              </div>

              <button
                onClick={() => setInspectStudentResume(null)}
                className="w-full mt-2 py-2.5 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                Close Inspect Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
