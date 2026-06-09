import React, { useState } from "react";
import { 
  Sparkles, Shield, User, Briefcase, GraduationCap, Users, 
  ArrowRight, Key, Mail, Phone, Code, BookOpen, Clock, LogIn, UserPlus, Info, CheckCircle2
} from "lucide-react";
import BorderGlow from "./BorderGlow";
import ShimmerButton from "./ShimmerButton";
import { UserRole } from "../types";
import { login as apiLogin, register as apiRegister } from "../api/auth";
import { ApiError } from "../api/client";

interface AuthPageProps {
  onLoginSuccess: (session: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    companyName?: string;
  }) => void;
  onClose?: () => void;
  initialRoleTab?: UserRole;
}

const DEMO_LOGINS = {
  aarav: { email: "aarav.sharma@collegetech.edu", password: "password123" },
  aditi: { email: "aditi.iyer@collegetech.edu", password: "password123" },
  rohan: { email: "rohan.v@collegetech.edu", password: "password123" },
  google: { email: "recruitment@google.com", password: "password123" },
  microsoft: { email: "careers@microsoft.com", password: "password123" },
  officer: { email: "placement.officer@collegetech.edu", password: "password123" },
  admin: { email: "admin.root@collegetech.edu", password: "password123" },
} as const;

export default function AuthPage({ 
  onLoginSuccess, 
  onClose,
  initialRoleTab = "student"
}: AuthPageProps) {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [selectedRole] = useState<UserRole>("student"); // Force student registration role

  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Student specific signup fields
  const [phone, setPhone] = useState("+91 ");
  const [linkedin, setLinkedin] = useState("https://linkedin.com/in/");
  const [github, setGithub] = useState("https://github.com/");
  const [degree, setDegree] = useState("B.Tech");
  const [major, setMajor] = useState("Computer Science");
  const [gradYear, setGradYear] = useState("2026");
  const [cgpa, setCgpa] = useState("8.5");

  // Recruiter specific fields
  const [companyName] = useState("");
  const [location] = useState("Bangalore (Onsite)");

  // Coordinator/Admin passcodes
  const [officerPasscode] = useState("");
  const [adminPasscode] = useState("");

  // Error/Success state feedback
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleModeChange = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const triggerDemoLogin = async (type: keyof typeof DEMO_LOGINS) => {
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const creds = DEMO_LOGINS[type];
      const { user } = await apiLogin(creds.email, creds.password);
      onLoginSuccess(user);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Login failed. Ensure backend is running and seeded.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please fill out both email and password fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (authMode === "signup") {
        if (!name.trim()) {
          setErrorMessage("Please enter your full name.");
          return;
        }
        if (!phone.trim() || !cgpa.trim()) {
          setErrorMessage("Please fill in candidate telephone and CGPA values.");
          return;
        }

        const payload: Parameters<typeof apiRegister>[0] = {
          name,
          email,
          password,
          role: "student",
          studentProfile: {
            phone,
            linkedin,
            github,
            academic: { degree, major, institution: "State Engineering College", graduationYear: gradYear, cgpa },
            resumeText: `${name.toUpperCase()} - Software Aspirant\nEmail: ${email} | Phone: ${phone}\nSkills: React, Python, JavaScript\nEducation: ${degree} in ${major} (CGPA: ${cgpa})`,
          },
        };

        setSuccessMessage(`Account created for ${name}. Logging you in...`);
        const { user } = await apiRegister(payload);
        setTimeout(() => onLoginSuccess(user), 800);
      } else {
        const { user } = await apiLogin(email, password);
        onLoginSuccess(user);
      }
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Authentication failed. Check credentials and backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Login / Register Panel */}
        <div className="md:col-span-7 flex flex-col">
          <BorderGlow 
            borderRadius={24} 
            className="p-6 md:p-8 shadow-xl border border-theme"
            backgroundColor="var(--bg-card)"
            colors={["#4F46E5", "#8B5CF6", "#3B82F6"]}
            glowColor="244 76 54"
            fillOpacity={0.08}
          >
            {/* Tab selection for Sign In / Sign Up */}
            <div className="flex bg-theme-elevated p-1.5 rounded-full mb-6 ring-1 ring-[var(--border)]">
              <button
                type="button"
                onClick={() => handleModeChange("signin")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-mono font-extrabold rounded-full transition-all ${
                  authMode === "signin"
                    ? "bg-theme-card text-theme-primary shadow-md border border-theme"
                    : "text-theme-muted hover:text-theme-primary"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("signup")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-mono font-extrabold rounded-full transition-all ${
                  authMode === "signup"
                    ? "bg-theme-card text-theme-primary shadow-md border border-theme"
                    : "text-theme-muted hover:text-theme-primary"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                CREATE ACCOUNT
              </button>
            </div>

            <div className="mb-6 text-center">
              <h2 className="text-xl font-serif font-bold text-theme-primary">
                {authMode === "signin" ? "PlacePro AI Secure Portal Login" : "Register Student Candidate Profile"}
              </h2>
              <p className="text-xs text-theme-secondary mt-1.5">
                {authMode === "signin" 
                  ? "Enter your registered credentials to access your portal dashboard." 
                  : "Fill in your details to create your AI-powered student candidate account."}
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3.5 text-xs font-semibold mb-6 flex items-start gap-2.5 animate-shake">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full shrink-0 mt-0.5 animate-pulse" />
                <span>{errorMessage}</span>
              </div>
            )}
 
            {/* Success Message */}
            {successMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3.5 text-xs font-semibold mb-6 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {authMode === "signup" && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-extrabold tracking-wider text-theme-secondary uppercase">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-theme-muted" />
                    <input
                      type="text"
                      placeholder="e.g. Vikram Singh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm bg-theme-elevated/40 border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 focus:bg-theme-card"
                      required
                    />
                  </div>
                </div>
              )}
 
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono font-extrabold tracking-wider text-theme-secondary uppercase">
                  College / Professional Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-theme-muted" />
                  <input
                    type="email"
                    placeholder="e.g. student@collegetech.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-theme-elevated/40 border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 focus:bg-theme-card"
                    required
                  />
                </div>
              </div>
 
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono font-extrabold tracking-wider text-theme-secondary uppercase">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-theme-muted" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-theme-elevated/40 border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 focus:bg-theme-card"
                    required
                  />
                </div>
              </div>

              {/* Dynamic signup subforms based on selected role */}
              {authMode === "signup" && selectedRole === "student" && (
                <div className="border-t border-theme pt-4 mt-2 flex flex-col gap-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-extrabold tracking-wider text-theme-secondary uppercase">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-theme-elevated/40 border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 focus:bg-theme-card"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-extrabold tracking-wider text-theme-secondary uppercase">
                        Current CGPA
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        max="10"
                        min="0"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-theme-elevated/40 border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 focus:bg-theme-card"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-extrabold tracking-wider text-theme-secondary uppercase">
                        Academic Degree
                      </label>
                      <select
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-theme-elevated/40 border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-indigo-500/50 focus:bg-theme-card"
                      >
                        <option value="B.Tech" className="bg-theme-card text-theme-primary">B.Tech</option>
                        <option value="M.Tech" className="bg-theme-card text-theme-primary">M.Tech</option>
                        <option value="MCA" className="bg-theme-card text-theme-primary">MCA</option>
                        <option value="BCA" className="bg-theme-card text-theme-primary">BCA</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-extrabold tracking-wider text-theme-secondary uppercase">
                        Branch / Major
                      </label>
                      <input
                        type="text"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-theme-elevated/40 border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 focus:bg-theme-card"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono font-extrabold tracking-wider text-theme-secondary uppercase">
                      LinkedIn URL
                    </label>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-theme-elevated/40 border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 focus:bg-theme-card"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono font-extrabold tracking-wider text-theme-secondary uppercase">
                      GitHub URL
                    </label>
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-theme-elevated/40 border border-theme rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 focus:bg-theme-card"
                    />
                  </div>
                </div>
              )}

              <ShimmerButton 
                type="submit" 
                disabled={isSubmitting} 
                background="linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)"
                shimmerColor="#ffffff"
                className="py-3 px-8 text-sm w-full mt-2 font-mono uppercase font-black border-none shadow-[0_4px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_25px_rgba(79,70,229,0.4)]"
              >
                {isSubmitting ? "Please wait..." : authMode === "signin" ? "Sign In to Portal" : "Complete Student Candidate Registration"}
              </ShimmerButton>


              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-center text-xs text-theme-muted hover:text-theme-primary py-1"
                >
                  Cancel and Return
                </button>
              )}
            </form>
          </BorderGlow>
        </div>

        {/* Right column: Quick demo login card dashboard */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="bg-theme-card p-5 rounded-3xl border border-theme flex flex-col gap-4 shadow-md">
            <div className="flex items-center gap-2 text-theme-primary font-serif font-bold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
              <span>One-Click Testing Accounts</span>
            </div>
            <p className="text-[11px] text-theme-secondary leading-relaxed">
              We pre-loaded test database users mapping each specialized dashboard framework role. Select a credentials pill below to log in instantly.
            </p>

            <div className="flex flex-col gap-3 mt-1">
              
              {/* Students quickies */}
              <div>
                <span className="text-[9px] font-mono font-bold tracking-wider text-theme-muted uppercase">STUDENTS (PRE-LOADED PROFILES)</span>
                <div className="flex flex-col gap-2 mt-1.5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => triggerDemoLogin("aarav")}
                    className="flex items-center justify-between p-2.5 text-xs bg-theme-elevated/50 hover:bg-theme-elevated border border-theme rounded-xl transition text-left text-theme-primary hover:border-indigo-500/30"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-[10px]">
                        AS
                      </div>
                      <div>
                        <div className="font-semibold text-theme-primary">Aarav Sharma</div>
                        <div className="text-[9px] text-theme-muted font-mono">B.Tech CSE (Verified)</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-theme-muted mr-1" />
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => triggerDemoLogin("aditi")}
                    className="flex items-center justify-between p-2.5 text-xs bg-theme-elevated/50 hover:bg-theme-elevated border border-theme rounded-xl transition text-left text-theme-primary hover:border-indigo-500/30"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-[10px]">
                        AI
                      </div>
                      <div>
                        <div className="font-semibold text-theme-primary">Aditi Iyer</div>
                        <div className="text-[9px] text-theme-muted font-mono">B.Tech IT (Pending)</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-theme-muted mr-1" />
                  </button>
                </div>
              </div>

              {/* Recruiter quickies */}
              <div className="pt-2 border-t border-theme">
                <span className="text-[9px] font-mono font-bold tracking-wider text-theme-muted uppercase">RECRUITERS</span>
                <div className="flex flex-col gap-2 mt-1.5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => triggerDemoLogin("google")}
                    className="flex items-center justify-between p-2.5 text-xs bg-theme-elevated/50 hover:bg-theme-elevated border border-theme rounded-xl transition text-left text-theme-primary hover:border-indigo-500/30"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-[10px]">
                        G
                      </div>
                      <div>
                        <div className="font-semibold text-theme-primary">Google India</div>
                        <div className="text-[9px] text-theme-muted font-mono">Company recruiter</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-theme-muted mr-1" />
                  </button>
                </div>
              </div>

              {/* Placement Officer & Root Admin */}
              <div className="pt-2 border-t border-theme">
                <span className="text-[9px] font-mono font-bold tracking-wider text-theme-muted uppercase">FINANCIALS / AUTHORITY</span>
                <div className="flex flex-col gap-2 mt-1.5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => triggerDemoLogin("officer")}
                    className="flex items-center justify-between p-2.5 text-xs bg-theme-elevated/50 hover:bg-theme-elevated border border-theme rounded-xl transition text-left text-theme-primary hover:border-indigo-500/30"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold text-[10px]">
                        PO
                      </div>
                      <div>
                        <div className="font-semibold text-theme-primary">Prof. Rajesh Mehra</div>
                        <div className="text-[9px] text-theme-muted font-mono">Placement Coordinator</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-theme-muted mr-1" />
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => triggerDemoLogin("admin")}
                    className="flex items-center justify-between p-2.5 text-xs bg-theme-elevated/50 hover:bg-theme-elevated border border-theme rounded-xl transition text-left text-theme-primary hover:border-indigo-500/30"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-[10px]">
                        AD
                      </div>
                      <div>
                        <div className="font-semibold text-theme-primary">System Admin</div>
                        <div className="text-[9px] text-theme-muted font-mono">Full Platform Audit</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-theme-muted mr-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
