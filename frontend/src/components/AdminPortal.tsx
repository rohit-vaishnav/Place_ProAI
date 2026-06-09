import React, { useState } from "react";
import { 
  ShieldCheck, Cpu, Database, Server, Settings, Activity, Users, 
  Trash2, Plus, RefreshCw, KeyRound, CheckCircle2, Lock
} from "lucide-react";
import { StudentProfile, Job, Application } from "../types";
import BorderGlow from "./BorderGlow";

interface AdminPortalProps {
  students: StudentProfile[];
  jobs: Job[];
  applications: Application[];
  onDeleteStudent: (studentId: string) => void;
  onGrantVerification: (studentId: string) => void;
  onClearCache: () => void;
}

export default function AdminPortal({
  students,
  jobs,
  applications,
  onDeleteStudent,
  onGrantVerification,
  onClearCache
}: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<"users" | "monitors" | "configurations">("users");
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


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LHS Menu Column */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="bg-[#120F17] text-white rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="w-14 h-14 bg-neutral-800 rounded-2xl flex items-center justify-center text-rose-500 font-mono font-black text-xl mb-4 border border-rose-500/20 shadow-md">
            SU
          </div>
          <h3 className="font-serif text-sm font-bold text-white tracking-wide">Root Administrator Dashboard</h3>
          <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest font-mono">Permission: Superuser</p>

          <div className="w-full mt-4 pt-4 border-t border-neutral-800 flex flex-col gap-3 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">Total Registered Users</span>
              <span className="bg-neutral-800 text-rose-400 px-2.5 py-0.5 rounded-full font-mono font-bold">{students.length + 2}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">Registered Openings</span>
              <span className="bg-neutral-800 text-rose-400 px-2.5 py-0.5 rounded-full font-mono font-bold">{jobs.length}</span>
            </div>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="bg-white rounded-2xl p-3 border border-neutral-200/50 shadow-sm flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "users" 
              ? "bg-[#E5EEE4] text-[#2D3748] border-l-4 border-[#A5C89E]" 
              : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" /> User Database Manager
          </button>
          <button
            onClick={() => setActiveTab("monitors")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "monitors" 
              ? "bg-[#E5EEE4] text-[#2D3748] border-l-4 border-[#A5C89E]" 
              : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <Cpu className="w-4 h-4 text-indigo-600 animate-pulse" /> Infrastructure Monitors
          </button>
          <button
            onClick={() => setActiveTab("configurations")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "configurations" 
              ? "bg-[#E5EEE4] text-[#2D3748] border-l-4 border-[#A5C89E]" 
              : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <Settings className="w-4 h-4 text-neutral-600" /> Platform Configurations
          </button>
        </div>
      </div>

      {/* Main Panel Content (RHS) */}
      <div className="lg:col-span-9 flex flex-col gap-6">

        {/* TAB 1: USER DATABASE */}
        {activeTab === "users" && (
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-800">User Authorizations Management Index</h2>
              <p className="text-xs text-neutral-500 mt-1">Audit security keys, credential structures, and delete mock seed nodes inside application storage memory.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 uppercase tracking-widest text-[9px] border-b border-neutral-200/60">
                    <th className="p-4 rounded-tl-xl">Registered Name</th>
                    <th className="p-4">Authorization Role</th>
                    <th className="p-4">Security Level State</th>
                    <th className="p-4">Cumulative GPA</th>
                    <th className="p-4 rounded-tr-xl text-center">Interactive Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {students.map(std => (
                    <tr key={std.id} className="hover:bg-neutral-50/50 transition">
                      <td className="p-4 font-bold text-[#2D3748]">
                        {std.name}
                        <span className="block text-[10px] text-neutral-400 font-normal mt-0.5">{std.email}</span>
                      </td>
                      <td className="p-4 text-neutral-600">
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono text-[10px] border border-emerald-100">
                          Student Candidate
                        </span>
                      </td>
                      <td className="p-4">
                        {std.verificationStatus === "Verified" ? (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            College Approved
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            Unverified Profile
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800">
                        {std.academic?.cgpa || "N/A"}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          {std.verificationStatus !== "Verified" && (
                            <button
                              onClick={() => onGrantVerification(std.id)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded transition"
                            >
                              Force Approve
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteStudent(std.id)}
                            className="p-1 px-2.5 bg-neutral-100 hover:bg-rose-100 text-neutral-400 hover:text-red-500 font-semibold rounded border border-neutral-200/30 transition"
                            title="Purge user record"
                          >
                            Purge
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Root nodes */}
                  <tr className="bg-neutral-50/20">
                    <td className="p-4 font-bold text-[#2D3748]">
                      Aravind S (Corporate Partner)
                      <span className="block text-[10px] text-neutral-400 font-normal mt-0.5">aravind@amazon.co.in</span>
                    </td>
                    <td className="p-4">
                      <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded font-mono text-[10px] border border-indigo-100">
                        Recruiter Key
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        Corporate Approved
                      </span>
                    </td>
                    <td className="p-4 font-mono">N/A</td>
                    <td className="p-4 text-center text-neutral-400 font-serif">Sys Reserve Node</td>
                  </tr>

                  <tr className="bg-neutral-50/20">
                    <td className="p-4 font-bold text-[#2D3748]">
                      State College Admin
                      <span className="block text-[10px] text-neutral-400 font-normal mt-0.5">dean@engineering.edu</span>
                    </td>
                    <td className="p-4">
                      <span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded font-mono text-[10px] border border-rose-100">
                        Placement lead
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        Dean Admin Authority
                      </span>
                    </td>
                    <td className="p-4 font-mono">N/A</td>
                    <td className="p-4 text-center text-neutral-400 font-serif">Sys Reserve Node</td>
                  </tr>
                </tbody>
              </table>
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
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono block mb-1">CPU footPrint</span>
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
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-800">Dynamic Platform Security Configurations</h2>
              <p className="text-xs text-neutral-500 mt-1">Configure global cookies, clear memory caches, or force initialize seed databases matching standard deployment checklists.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col justify-between items-start gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-850 flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-emerald-600" /> Platform Auth Token Storage Cache</h4>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">Empties all cached static files in Drizzle ORM and resets placement records to seed assets default values.</p>
                </div>
                <button
                  onClick={handleEvacuateSystemCache}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  Truncate Cache & Evacuate Cookie
                </button>
              </div>

              <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col justify-between items-start gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-850 flex items-center gap-1.5"><Lock className="w-4 h-4 text-indigo-600" /> API Safety Gateway Verification State</h4>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">Verifies server-side authorization tokens and ensures secure endpoints map accurately to user ports.</p>
                </div>
                <span className="text-[10px] font-bold text-[#A5C89E] bg-[#E5EEE4] border border-[#A5C89E] px-2.5 py-1 rounded-full">
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
