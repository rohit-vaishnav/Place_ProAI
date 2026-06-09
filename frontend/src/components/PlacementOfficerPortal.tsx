import React, { useState } from "react";
import { 
  Check, X, AlertTriangle, Calendar, Plus, Trash2, Award, 
  MapPin, GraduationCap, Building2, Eye, UserCheck, BarChart3, TrendingUp, HelpCircle
} from "lucide-react";
import { StudentProfile, Job, PlacementDrive } from "../types";
import BorderGlow from "./BorderGlow";

interface PlacementOfficerPortalProps {
  students: StudentProfile[];
  jobs: Job[];
  drives: PlacementDrive[];
  onVerifyStudent: (studentId: string, status: "Verified" | "Rejected", remarks?: string) => void;
  onVerifyJob: (jobId: string, status: "Approved" | "Rejected", remarks?: string) => void;
  onAddDrive: (drive: PlacementDrive) => void;
  onDeleteDrive: (driveId: string) => void;
}

export default function PlacementOfficerPortal({
  students,
  jobs,
  drives,
  onVerifyStudent,
  onVerifyJob,
  onAddDrive,
  onDeleteDrive
}: PlacementOfficerPortalProps) {
  const [activeTab, setActiveTab] = useState<"verifications" | "jobs-ver" | "drives" | "analytics">("verifications");

  // Drive scheduling forms
  const [showAddDrive, setShowAddDrive] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [startDate, setStartDate] = useState("2026-06-30");
  const [eligibleCourses, setEligibleCourses] = useState("B.Tech CSE/IT");
  const [cgpaCutoff, setCgpaCutoff] = useState("8.0");
  const [location, setLocation] = useState("Campus Auditorium");

  // Inspect student resume or verify remarks modal
  const [inspectStudent, setInspectStudent] = useState<StudentProfile | null>(null);
  const [remarks, setRemarks] = useState("");

  const pendingStudents = students.filter(s => s.verificationStatus === "Pending");
  const pendingJobs = jobs.filter(j => j.verificationStatus === "Pending");

  const handleSubmitDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    const newDrive: PlacementDrive = {
      id: "drive_" + Date.now(),
      companyName,
      startDate,
      eligibleCourses: eligibleCourses.split(",").map(c => c.trim()),
      cgpaCutoff: parseFloat(cgpaCutoff) || 7.0,
      registeredCount: 0,
      status: "Upcoming",
      location
    };
    onAddDrive(newDrive);

    // Reset
    setShowAddDrive(false);
    setCompanyName("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LHS Menu Column */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/50 shadow-sm flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-3xl flex items-center justify-center text-indigo-700 font-serif font-black text-2xl mb-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-neutral-200/20">
            PO
          </div>
          <h3 className="font-serif text-md text-slate-800 font-bold">State Campus Office</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Placement & Verification Lead</p>

          <div className="w-full mt-4 pt-4 border-t border-neutral-100 flex flex-col gap-3 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">Pending Students</span>
              <span className="bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-100 font-mono font-bold">{pendingStudents.length}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">Pending Jobs</span>
              <span className="bg-rose-50 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-100 font-mono font-bold">{pendingJobs.length}</span>
            </div>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="bg-white rounded-2xl p-3 border border-neutral-200/50 shadow-sm flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("verifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "verifications" 
              ? "bg-[#E5EEE4] text-[#2D3748] border-l-4 border-[#A5C89E]" 
              : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" /> Student Verification
          </button>
          <button
            onClick={() => setActiveTab("jobs-ver")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "jobs-ver" 
              ? "bg-[#E5EEE4] text-[#2D3748] border-l-4 border-[#A5C89E]" 
              : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-600" /> Job Post Reviews
          </button>
          <button
            onClick={() => setActiveTab("drives")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "drives" 
              ? "bg-[#E5EEE4] text-[#2D3748] border-l-4 border-[#A5C89E]" 
              : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <Calendar className="w-4 h-4 text-rose-600" /> Placement Drive Schedule
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "analytics" 
              ? "bg-[#E5EEE4] text-[#2D3748] border-l-4 border-[#A5C89E]" 
              : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" /> Drive Visual Analytics
          </button>
        </div>
      </div>

      {/* Main Panel Content (RHS) */}
      <div className="lg:col-span-9 flex flex-col gap-6">

        {/* TAB 1: PENDING STUDENTS VERIFICATION */}
        {activeTab === "verifications" && (
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-800">Student Profile Credentials Audit</h2>
              <p className="text-xs text-neutral-500 mt-1">Legitimize candidate files inside campus database logs. Approve verified credentials so students are permitted to apply for corporate hiring drives.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 uppercase tracking-widest text-[9px] border-b border-neutral-200/60">
                    <th className="p-4 rounded-tl-xl">Inquirer Candidate</th>
                    <th className="p-4">Academic stream</th>
                    <th className="p-4">Cumulative CGPA</th>
                    <th className="p-4">Profile Score</th>
                    <th className="p-4 text-center rounded-tr-xl">Verification Action Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {students.map(s => {
                    const isPending = s.verificationStatus === "Pending";
                    return (
                      <tr key={s.id} className="hover:bg-neutral-50/50 transition">
                        <td className="p-4 font-bold text-[#2D3748]">
                          {s.name}
                          <span className="block text-[10px] text-neutral-400 font-normal mt-0.5">{s.email}</span>
                        </td>
                        <td className="p-4 text-neutral-600 font-serif">
                          {s.academic?.degree} in {s.academic?.major}, graduating {s.academic?.graduationYear}
                        </td>
                        <td className="p-4 font-mono font-bold text-indigo-700">
                          {s.academic?.cgpa} / 10
                        </td>
                        <td className="p-4">
                          <span className="bg-neutral-100 font-medium py-1 px-2.5 rounded font-mono text-neutral-700">
                            {s.atsScore ? `${s.atsScore}%` : "Draft Check Pending"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex gap-1.5 justify-center">
                            <button
                              onClick={() => setInspectStudent(s)}
                              className="p-1 px-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded text-neutral-700 font-medium transition flex items-center gap-1"
                              title="Inspect full application text"
                            >
                              <Eye className="w-3.5 h-3.5" /> inspect
                            </button>
                            
                            {(isPending || s.verificationStatus === "Unsubmitted") && (
                              <>
                                <button
                                  onClick={() => onVerifyStudent(s.id, "Verified")}
                                  className="p-1 px-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded transition"
                                  title="Certify verification APPROVED"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const rem = prompt("State reasons for rejecting candidate qualifications:");
                                    if (rem) {
                                      onVerifyStudent(s.id, "Rejected", rem);
                                    }
                                  }}
                                  className="p-1 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-medium rounded transition"
                                  title="Reject student profiles due to index typos"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {s.verificationStatus === "Verified" && (
                              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 rounded px-2.5 py-1 border border-emerald-100">
                                Cert verified
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PENDING JOBS REVIEW */}
        {activeTab === "jobs-ver" && (
          <div className="bg-white p-6 rounded-2xl border border-[#E5EEE4]/40 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-800">Recruiter Job Post Reviews Desk</h2>
              <p className="text-xs text-neutral-500 mt-1">Review vacancies posted by corporate hiring entities. Every recruitment opening must be verified before it is displayed on active student job boards.</p>
            </div>

            <div className="flex flex-col gap-4">
              {jobs.map(job => {
                const isPending = job.verificationStatus === "Pending";
                return (
                  <div key={job.id} className="bg-neutral-50/50 rounded-2xl p-5 border border-neutral-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-mono text-[10px] bg-indigo-50 border border-indigo-100 py-0.5 px-2 rounded-md font-bold text-indigo-700 uppercase tracking-widest">
                          {job.recruiterName}
                        </span>
                        <span className={`text-[9px] font-bold py-0.5 px-1.5 rounded ${
                          job.verificationStatus === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700 animate-pulse"
                        }`}>
                          {job.verificationStatus === "Approved" ? "VISIBLE ON BOARDS" : "REVIEW REQUIRED"}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#2D3748]">{job.title}</h3>
                      <p className="text-xs text-neutral-500 mt-1">{job.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t border-neutral-200/50 text-[10px] text-neutral-500">
                        <div>Salary: <strong>{job.salary}</strong></div>
                        <div>Loc: <strong>{job.location}</strong></div>
                        <div className="col-span-2">Required Course Eligibility: <strong>{job.eligibility}</strong></div>
                      </div>
                    </div>

                    <div className="shrink-0 flex gap-2 self-end md:self-auto">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => onVerifyJob(job.id, "Approved")}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition"
                          >
                            Approve Post
                          </button>
                          <button
                            onClick={() => {
                              const note = prompt("State reasons for rejecting recruiter postings:");
                              if (note) {
                                onVerifyJob(job.id, "Rejected", note);
                              }
                            }}
                            className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold"
                          >
                            Reject Post
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 p-2 rounded-lg">
                          APPROVED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {jobs.length === 0 && (
                <div className="text-center p-8 bg-neutral-50 text-neutral-400 font-serif text-xs rounded-xl">
                  No active recruiter postings to review on record.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PLACEMENT DRIVES */}
        {activeTab === "drives" && (
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3 flex-wrap gap-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-slate-800">Placement Drive Schedules Matrix</h2>
                <p className="text-xs text-neutral-500 mt-1">Schedule and manage upcoming corporate campus visitation calendars.</p>
              </div>

              {!showAddDrive && (
                <button
                  onClick={() => setShowAddDrive(true)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" /> Schedule Drive
                </button>
              )}
            </div>

            {/* NEW DRIVE FORM */}
            {showAddDrive && (
              <form onSubmit={handleSubmitDrive} className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-600 block mb-1">Company Visiting Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. Amazon India Corp"
                      className="w-full text-xs bg-white border border-neutral-200 p-3 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-600 block mb-1">Drive Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-200 p-3 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-xs font-bold text-neutral-600 block mb-1">Eligible Courses (Comma separated)</label>
                    <input type="text" value={eligibleCourses} onChange={e => setEligibleCourses(e.target.value)} className="w-full border border-neutral-200 p-2.5 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-600 block mb-1">GPA / CGPA Cutoff</label>
                    <input type="text" value={cgpaCutoff} onChange={e => setCgpaCutoff(e.target.value)} className="w-full border border-neutral-200 p-2.5 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-600 block mb-1">Campus Venue Location</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full border border-neutral-200 p-2.5 rounded-lg bg-white" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xs pt-2">
                  <button type="button" onClick={() => setShowAddDrive(false)} className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg font-semibold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-emerald-700 text-white rounded-lg font-bold">Register visitation</button>
                </div>
              </form>
            )}

            {/* DRIVES ROW DRIVES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drives.map(drive => (
                <div key={drive.id} className="bg-white border border-neutral-200 p-5 rounded-2xl hover:border-neutral-300 shadow-sm transition flex flex-col gap-4 justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="font-mono text-[9px] font-bold text-rose-700 uppercase tracking-widest bg-rose-50 border border-rose-100 py-0.5 px-2 rounded">
                        VISITING DRIVE
                      </span>
                      <button onClick={() => onDeleteDrive(drive.id)} className="text-neutral-300 hover:text-red-500 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="font-serif text-sm font-bold text-slate-800 mt-2.5 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-neutral-400 shrink-0" /> {drive.companyName}
                    </h3>
                    
                    <div className="flex flex-col gap-1.5 text-xs text-neutral-500 mt-3 pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Start: {drive.startDate}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Venue: {drive.location}</div>
                      <div className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> GPA Cutoff: <strong>{drive.cgpaCutoff}+</strong></div>
                    </div>
                  </div>

                  <div className="w-full bg-[#E5EEE4]/60 p-3 rounded-xl border border-[#A5C89E]/20 text-[10px] text-slate-700 flex justify-between items-center mt-1">
                    <span>Target: {drive.eligibleCourses.join(", ")}</span>
                    <span className="font-bold underline">{drive.registeredCount} active RSVPs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VISUAL ANALYTICS DIAGRAM */}
        {activeTab === "analytics" && (
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2D3748]">Visual Drive Analytics Performance</h2>
              <p className="text-xs text-neutral-500 mt-1">Comprehensive index matching campus metrics, verified applicant counts, and corporate performance scores.</p>
            </div>

            {/* Custom crafted SVG data diagram */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 border border-neutral-200 rounded-2xl bg-neutral-50/50 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-700">Student Placement Progress funnel</h4>
                
                {/* Custom SVG line bar chart */}
                <div className="flex flex-col gap-4 pt-2">
                  <div>
                    <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
                      <span>Total Active Enrolled Batches</span>
                      <strong className="font-mono text-slate-700">120 Students</strong>
                    </div>
                    {/* SVG Progress */}
                    <div className="w-full h-2.5 bg-neutral-200/60 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-800 rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs text-[#2D3748] mb-1">
                      <span>Certified verified by College Office</span>
                      <strong className="font-mono text-[#2D3748]">85 Candidates</strong>
                    </div>
                    {/* SVG Progress */}
                    <div className="w-full h-2.5 bg-neutral-200/60 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A5C89E] rounded-full" style={{ width: "70.8%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
                      <span>Placed / Corporate Offers Locked</span>
                      <strong className="font-mono text-[#2D3748]">42 Students</strong>
                    </div>
                    {/* SVG Progress */}
                    <div className="w-full h-2.5 bg-neutral-200/60 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-700 rounded-full" style={{ width: "35%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recruitment Drives comparison list */}
              <div className="p-5 border border-neutral-200 rounded-2xl bg-neutral-50/50 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-700">Visiting Corporate Stats comparison</h4>
                
                {/* SVG Visual Bars */}
                <div className="flex-1 flex flex-col justify-around gap-3 pt-1">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-20 truncate text-neutral-500">Google Drive:</span>
                    <div className="flex-1 h-6 bg-indigo-50 border border-indigo-100 rounded-md relative overflow-hidden flex items-center pl-2 text-[10px] text-indigo-900 font-bold">
                      <div className="absolute inset-0 bg-indigo-200/40" style={{ width: "85%" }} />
                      <span className="relative">85 Candidates Checked</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-20 truncate text-neutral-500">Microsoft Co:</span>
                    <div className="flex-1 h-6 bg-rose-50 border border-rose-100 rounded-md relative overflow-hidden flex items-center pl-2 text-[10px] text-rose-950 font-bold">
                      <div className="absolute inset-0 bg-rose-200/40" style={{ width: "65%" }} />
                      <span className="relative">65 Candidates Screened</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-20 truncate text-neutral-500">Infosys Drive:</span>
                    <div className="flex-1 h-6 bg-emerald-50 border border-emerald-100 rounded-md relative overflow-hidden flex items-center pl-2 text-[10px] text-emerald-950 font-bold">
                      <div className="absolute inset-0 bg-emerald-200/40" style={{ width: "95%" }} />
                      <span className="relative">192 Candidates RSVped</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Placement rate summary block */}
            <div className="bg-[#E5EEE4] p-5 rounded-2xl border border-[#A5C89E]/40 flex flex-col md:flex-row items-center justify-between gap-5 mt-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-emerald-800 shrink-0" />
                <div className="text-slate-800">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900">Placement Target Achievement Index</h4>
                  <p className="text-xs text-emerald-850 mt-1">Average candidate resume compatibility score has increased by **12.4%** following recursive AI Analyzer feedback loops.</p>
                </div>
              </div>
              <span className="font-serif text-3xl font-bold text-emerald-950 shrink-0">86.2% Placed</span>
            </div>
          </div>
        )}

        {/* MODAL: INSPECT INDIVIDUAL STUDENT SUBMISSIONS */}
        {inspectStudent && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-neutral-300 p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                <h3 className="font-serif text-sm font-bold text-emerald-800">Audit Student Profile Verification Panel</h3>
                <button onClick={() => setInspectStudent(null)} className="p-1 px-1.5 hover:bg-neutral-100 rounded text-neutral-500 font-bold">×</button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#2D3748] mb-1">{inspectStudent.name}</h4>
                <p className="text-[10px] text-neutral-400 mb-4">{inspectStudent.email} | {inspectStudent.phone}</p>
                
                <h5 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-t border-neutral-100 pt-3 mb-2">Qualifications Index</h5>
                <p className="text-xs text-slate-800">Target Degree: <strong>{inspectStudent.academic?.degree} in {inspectStudent.academic?.major}</strong>, graduating {inspectStudent.academic?.graduationYear}. Verified Cumulative CGPA: <strong>{inspectStudent.academic?.cgpa}/10</strong></p>

                <h5 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-t border-neutral-100 pt-3 mb-2 mt-4">Verified Skill Inventory</h5>
                <div className="flex flex-wrap gap-1 mb-4">
                  {inspectStudent.skills?.map((s, idx) => (
                    <span key={idx} className="bg-neutral-100 text-[10px] font-medium py-1 px-2 rounded">{s}</span>
                  ))}
                </div>

                <h5 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-t border-neutral-100 pt-3 mb-2">Portfolio Projects</h5>
                <div className="grid grid-cols-1 gap-2.5 mb-4">
                  {inspectStudent.projects?.map((prj, prjIdx) => (
                    <div key={prjIdx} className="bg-neutral-50/50 p-3 rounded-xl border border-neutral-200 text-xs">
                      <span className="font-bold block text-slate-800">{prj.name} <span className="font-mono text-[9px] bg-[#E5EEE4] border py-0.5 px-1 rounded ml-1.5">{prj.tech}</span></span>
                      <p className="text-[11px] text-neutral-500 mt-1">{prj.desc}</p>
                    </div>
                  ))}
                </div>

                <h5 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-t border-neutral-100 pt-3 mb-2">Custom Audit Phrasings</h5>
                <pre className="text-[11px] font-mono leading-relaxed bg-neutral-50 text-neutral-700 p-4 border border-neutral-200 rounded-xl overflow-x-auto whitespace-pre-wrap max-h-[200px]">
                  {inspectStudent.resumeText || "No text-based copy has been uploaded on record."}
                </pre>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onVerifyStudent(inspectStudent.id, "Verified");
                    setInspectStudent(null);
                  }}
                  className="flex-1 py-3 bg-[#A5C89E] hover:bg-[#9CAB84] text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  Verify Profile Approved
                </button>
                <button
                  onClick={() => {
                    const note = prompt("Enter verification feedback / modifications requested:");
                    if (note) {
                      onVerifyStudent(inspectStudent.id, "Rejected", note);
                      setInspectStudent(null);
                    }
                  }}
                  className="flex-1 py-3 bg-red-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition"
                >
                  Request Profile Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
