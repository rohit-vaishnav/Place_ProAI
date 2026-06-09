import React, { useState } from "react";
import { 
  ShieldCheck, Cpu, Database, Server, Settings, Activity, Users, 
  Trash2, Plus, RefreshCw, KeyRound, CheckCircle2, Lock, UserPlus, Mail, Key, Briefcase, MapPin
} from "lucide-react";
import { StudentProfile, Job, Application } from "../types";
import BorderGlow from "./BorderGlow";
import { AdminUser } from "../api/admin";

interface AdminPortalProps {
  students: StudentProfile[];
  jobs: Job[];
  applications: Application[];
  onDeleteStudent: (studentId: string) => void;
  onGrantVerification: (studentId: string) => void;
  onClearCache: () => void;
  users: AdminUser[];
  onDeleteUser: (userId: string) => void;
  onCreateUser: (payload: any) => Promise<void>;
}

export default function AdminPortal({
  students,
  jobs,
  applications,
  onDeleteStudent,
  onGrantVerification,
  onClearCache,
  users = [],
  onDeleteUser,
  onCreateUser
}: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<"users" | "monitors" | "configurations">("users");
  
  // Create User Form State
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"student" | "recruiter" | "placementOfficer" | "admin">("student");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyLocation, setNewCompanyLocation] = useState("");
  
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [logs, setLogs] = useState<string[]>([
    "[11:15:30] SYSTEM INITIALIZED: Express listener running at host 0.0.0.0 bind port 3000",
    "[11:15:32] GROQ COMPILER: API client successfully built with standard User-Agent header",
    "[11:16:02] ATS ENGINE: Processed resume text matching standard AST definitions",
    "[11:20:15] AUTHENTICATION: Local developer session authorized for admin workspace",
    "[11:21:44] ANALYTICS METRIC: Successfully evaluated fit rankings for candidates applying to Software Intern jobs",
  ]);

  const [simulatedLoad, setSimulatedLoad] = useState({
    cpu: 18,
    memory: 452,
    apiRequests: 142
  });

  const [isRefreshingMonitor, setIsRefreshingMonitor] = useState(false);

  const triggerRefreshSystemState = () => {
    setIsRefreshingMonitor(true);
    setTimeout(() => {
      setSimulatedLoad({
        cpu: Math.floor(Math.random() * 25) + 10,
        memory: Math.floor(Math.random() * 80) + 420,
        apiRequests: simulatedLoad.apiRequests + Math.floor(Math.random() * 15)
      });
      setLogs(prev => [
        `[${new Date().toLocaleTimeString()}] MONITORS POLLING: Successfully verified microservice states`,
        ...prev
      ]);
      setIsRefreshingMonitor(false);
    }, 400);
  };

  const handleEvacuateSystemCache = () => {
    onClearCache();
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] MEMORY CLEANUP: Truncated Express static file compiler and Drizzle session cookies`,
      ...prev
    ]);
    alert("Application session cache database state truncated successfully!");
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      setFormError("Please fill in name, email, and password.");
      return;
    }

    setFormSubmitting(true);
    try {
      await onCreateUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        companyName: newUserRole === "recruiter" ? newCompanyName : undefined,
        location: newUserRole === "recruiter" ? newCompanyLocation : undefined,
      });

      setFormSuccess(`Account successfully created for ${newUserName}!`);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewCompanyName("");
      setNewCompanyLocation("");
    } catch (err: any) {
      setFormError(err.message || "Failed to create user account. Ensure email is unique.");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LHS Menu Column */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="bg-theme-card text-theme-primary border border-theme rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="w-14 h-14 bg-theme-elevated rounded-2xl flex items-center justify-center text-rose-500 font-mono font-black text-xl mb-4 border border-rose-500/20 shadow-md">
            SU
          </div>
          <h3 className="font-serif text-sm font-bold text-theme-primary tracking-wide">Root Administrator Dashboard</h3>
          <p className="text-[10px] text-theme-muted mt-1 uppercase tracking-widest font-mono">Permission: Superuser</p>

          <div className="w-full mt-4 pt-4 border-t border-theme flex flex-col gap-3 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-theme-secondary">Total Registered Users</span>
              <span className="bg-theme-elevated text-theme-primary px-2.5 py-0.5 rounded-full font-mono font-bold">{users.length}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-theme-secondary">Registered Openings</span>
              <span className="bg-theme-elevated text-theme-primary px-2.5 py-0.5 rounded-full font-mono font-bold">{jobs.length}</span>
            </div>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="bg-theme-card rounded-2xl p-3 border border-theme shadow-sm flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "users" 
              ? "bg-theme-elevated text-theme-primary border-l-4 border-indigo-500 font-semibold" 
              : "text-theme-secondary hover:bg-theme-elevated/40"
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" /> User Database Manager
          </button>
          <button
            onClick={() => setActiveTab("monitors")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "monitors" 
              ? "bg-theme-elevated text-theme-primary border-l-4 border-indigo-500 font-semibold" 
              : "text-theme-secondary hover:bg-theme-elevated/40"
            }`}
          >
            <Cpu className="w-4 h-4 text-indigo-600 animate-pulse" /> Infrastructure Monitors
          </button>
          <button
            onClick={() => setActiveTab("configurations")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "configurations" 
              ? "bg-theme-elevated text-theme-primary border-l-4 border-indigo-500 font-semibold" 
              : "text-theme-secondary hover:bg-theme-elevated/40"
            }`}
          >
            <Settings className="w-4 h-4 text-theme-muted" /> Platform Configurations
          </button>
        </div>
      </div>

      {/* Main Panel Content (RHS) */}
      <div className="lg:col-span-9 flex flex-col gap-6">

        {/* TAB 1: USER DATABASE */}
        {activeTab === "users" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* User List Table (LHS inside Tab 1) */}
            <div className="xl:col-span-8 bg-theme-card p-6 rounded-2xl border border-theme shadow-sm flex flex-col gap-6">
              <div>
                <h2 className="font-serif text-lg font-bold text-theme-primary">User Authorizations Management Index</h2>
                <p className="text-xs text-theme-muted mt-1">Audit student profiles, recruiters, placement officers and system administrators below.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-theme-elevated/30 text-theme-muted uppercase tracking-widest text-[9px] border-b border-theme">
                      <th className="p-4 rounded-tl-xl">Registered Name</th>
                      <th className="p-4">Authorization Role</th>
                      <th className="p-4">Status / Verification</th>
                      <th className="p-4">CGPA</th>
                      <th className="p-4 rounded-tr-xl text-center">Interactive Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme">
                    {users.map(u => {
                      const std = students.find(s => s.id === u.id);
                      return (
                        <tr key={u.id} className="hover:bg-theme-elevated/20 transition">
                          <td className="p-4 font-bold text-theme-primary">
                            {u.name}
                            <span className="block text-[10px] text-theme-muted font-normal mt-0.5">{u.email}</span>
                          </td>
                          <td className="p-4 text-theme-secondary">
                            <span className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
                              u.role === "student" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                              u.role === "recruiter" ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" :
                              u.role === "placementOfficer" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                              "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            }`}>
                              {u.role === "student" ? "Student" :
                               u.role === "recruiter" ? `Recruiter (${u.companyName || "N/A"})` :
                               u.role === "placementOfficer" ? "Officer" :
                               "System Admin"}
                            </span>
                          </td>
                          <td className="p-4">
                            {u.role === "student" ? (
                              std?.verificationStatus === "Verified" ? (
                                <span className="bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-500/20">
                                  Verified
                                </span>
                              ) : (
                                <span className="bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-500/20">
                                  Pending
                                </span>
                              )
                            ) : (
                              <span className="bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-500/20">
                                Approved
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-mono font-bold text-theme-primary">
                            {u.role === "student" ? (std?.academic?.cgpa || "N/A") : "N/A"}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2 justify-center">
                              {u.role === "student" && std && std.verificationStatus !== "Verified" && (
                                <button
                                  onClick={() => onGrantVerification(std.id)}
                                  className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded transition text-[10px]"
                                >
                                  Verify
                                </button>
                              )}
                              <button
                                onClick={() => onDeleteUser(u.id)}
                                className="p-1 px-2.5 bg-theme-elevated hover:bg-rose-500/20 text-theme-muted hover:text-rose-500 font-semibold rounded border border-theme transition text-[10px]"
                                title="Purge user record"
                              >
                                Purge
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create User Form (RHS inside Tab 1) */}
            <div className="xl:col-span-4">
              <BorderGlow 
                borderRadius={20} 
                className="p-5 shadow-xl border border-theme"
                backgroundColor="var(--bg-card)"
                colors={["#4F46E5", "#10B981", "#1E3A8A"]}
                glowColor="79 70 229"
                fillOpacity={0.08}
              >
                <div className="flex items-center gap-2 text-theme-primary font-serif font-bold text-sm mb-4">
                  <UserPlus className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Admin User Creator</span>
                </div>
                
                <p className="text-[11px] text-theme-secondary mb-4 leading-relaxed">
                  As an Administrator, you can create new system accounts bypassing college passcodes.
                </p>

                {formError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl p-3 text-xs font-semibold mb-4">
                    {formError}
                  </div>
                )}

                {formSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl p-3 text-xs font-semibold mb-4">
                    {formSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateUserSubmit} className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-extrabold tracking-wider text-theme-secondary uppercase">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dean R. K. Sen"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-theme-elevated/30 border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 focus:bg-theme-card"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-extrabold tracking-wider text-theme-secondary uppercase">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-theme-muted" />
                      <input
                        type="email"
                        placeholder="e.g. officer.sen@collegetech.edu"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-theme-elevated/30 border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 focus:bg-theme-card"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-extrabold tracking-wider text-theme-secondary uppercase">
                      Password
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 w-4 h-4 text-theme-muted" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-theme-elevated/30 border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 focus:bg-theme-card"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-extrabold tracking-wider text-theme-secondary uppercase">
                      Access Role
                    </label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm bg-theme-elevated/30 border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-indigo-500/50 focus:bg-theme-card"
                    >
                      <option value="student">Student Candidate</option>
                      <option value="recruiter">Corporate Recruiter</option>
                      <option value="placementOfficer">Placement Officer</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>

                  {newUserRole === "recruiter" && (
                    <div className="border-t border-theme pt-3 mt-1 flex flex-col gap-3.5 animate-fade-in">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-mono font-extrabold tracking-wider text-theme-secondary uppercase">
                          Company Name
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-theme-muted" />
                          <input
                            type="text"
                            placeholder="e.g. Netflix India"
                            value={newCompanyName}
                            onChange={(e) => setNewCompanyName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-theme-elevated/30 border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 focus:bg-theme-card"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-mono font-extrabold tracking-wider text-theme-secondary uppercase">
                          Office Location
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-theme-muted" />
                          <input
                            type="text"
                            placeholder="e.g. Mumbai (Hybrid)"
                            value={newCompanyLocation}
                            onChange={(e) => setNewCompanyLocation(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-theme-elevated/30 border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 focus:bg-theme-card"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-2.5 px-4 mt-2 text-xs font-mono font-black uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition disabled:opacity-50"
                  >
                    {formSubmitting ? "Creating..." : "Create User Account"}
                  </button>
                </form>
              </BorderGlow>
            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM MONITOR */}
        {activeTab === "monitors" && (
          <div className="bg-[#120F17] text-[#BFBFBF] p-6 rounded-2xl border border-neutral-800 shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-white tracking-wide">Live Infrastructure Microservices Dashboard</h2>
                <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest font-mono">Real-Time Core Container Metrics</p>
              </div>

              <button
                onClick={triggerRefreshSystemState}
                disabled={isRefreshingMonitor}
                className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-mono rounded-lg flex items-center gap-2 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingMonitor ? 'animate-spin' : ''}`} /> Polling Core States
              </button>
            </div>

            {/* Simulated indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono block mb-1">CPU footprint</span>
                  <div className="text-3xl font-mono font-bold text-emerald-400">{simulatedLoad.cpu}%</div>
                </div>
                <div className="w-full bg-neutral-800 h-1 rounded overflow-hidden mt-3">
                  <div className="h-full bg-emerald-400" style={{ width: `${simulatedLoad.cpu}%` }} />
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono block mb-1">Container Allocated Memory</span>
                  <div className="text-3xl font-mono font-bold text-indigo-400">{simulatedLoad.memory} MB / <span className="text-xs text-neutral-500">1 GB</span></div>
                </div>
                <div className="w-full bg-neutral-800 h-1 rounded overflow-hidden mt-3">
                  <div className="h-full bg-indigo-400" style={{ width: `${(simulatedLoad.memory / 1000) * 100}%` }} />
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono block mb-1">Runtime API calls count</span>
                  <div className="text-3xl font-mono font-bold text-rose-400">{simulatedLoad.apiRequests} requests</div>
                </div>
                <div className="w-full bg-neutral-800 h-1 rounded overflow-hidden mt-3">
                  <div className="h-full bg-rose-400" style={{ width: "65%" }} />
                </div>
              </div>
            </div>

            {/* Logs console */}
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-400">Platform Activity Logs (Stdout)</span>
              <div className="p-4 bg-black/90 font-mono text-[10px] leading-relaxed rounded-xl border border-neutral-800 text-zinc-300 max-h-[220px] overflow-y-auto flex flex-col-reverse gap-1.5 scrollbar-thin">
                {logs.map((log, index) => (
                  <div key={index} className="hover:text-white transition-all cursor-default">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM CONFIGS */}
        {activeTab === "configurations" && (
          <div className="bg-theme-card p-6 rounded-2xl border border-theme shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-theme-primary">Dynamic Platform Security Configurations</h2>
              <p className="text-xs text-theme-muted mt-1">Configure global cookies, clear memory caches, or force initialize seed databases matching standard deployment checklists.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-theme-elevated/20 border border-theme rounded-xl flex flex-col justify-between items-start gap-4 shadow-sm">
                <div>
                  <h4 className="text-xs font-bold text-theme-primary flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-emerald-600" /> Platform Auth Token Storage Cache</h4>
                  <p className="text-[11px] text-theme-muted mt-1 leading-relaxed">Empties all cached static files in Drizzle ORM and resets placement records to seed assets default values.</p>
                </div>
                <button
                  onClick={handleEvacuateSystemCache}
                  className="px-4 py-2 bg-theme-elevated hover:bg-theme-elevated/80 border border-theme text-theme-primary rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  Truncate Cache & Evacuate Cookie
                </button>
              </div>

              <div className="p-5 bg-theme-elevated/20 border border-theme rounded-xl flex flex-col justify-between items-start gap-4 shadow-sm">
                <div>
                  <h4 className="text-xs font-bold text-theme-primary flex items-center gap-1.5"><Lock className="w-4 h-4 text-indigo-600" /> API Safety Gateway Verification State</h4>
                  <p className="text-[11px] text-theme-muted mt-1 leading-relaxed">Verifies server-side authorization tokens and ensures secure endpoints map accurately to user ports.</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  SSL/OAUTH GATEWAY SECURED
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
