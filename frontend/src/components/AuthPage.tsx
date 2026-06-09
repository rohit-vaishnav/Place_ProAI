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
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRoleTab);

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
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("Bangalore (Onsite)");

  // Coordinator/Admin passcodes
  const [officerPasscode, setOfficerPasscode] = useState("");
  const [adminPasscode, setAdminPasscode] = useState("");

  // Error/Success state feedback
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage("");
    setSuccessMessage("");
  };

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
console.log("Selected Role:", selectedRole);
        if (selectedRole === "student" && (!phone.trim() || !cgpa.trim())) {
          setErrorMessage("Please fill in candidate telephone and CGPA values.");
          return;
        }

        if (selectedRole === "recruiter" && !companyName.trim()) {
          setErrorMessage("Please enter your corporate company name.");
          return;
        }

        const payload: Parameters<typeof apiRegister>[0] = {
          name,
          email,
          password,
          role: selectedRole,
        };

        if (selectedRole === "student") {
          payload.studentProfile = {
            phone,
            linkedin,
            github,
            academic: { degree, major, institution: "State Engineering College", graduationYear: gradYear, cgpa },
            resumeText: `${name.toUpperCase()} - Software Aspirant\nEmail: ${email} | Phone: ${phone}\nSkills: React, Python, JavaScript\nEducation: ${degree} in ${major} (CGPA: ${cgpa})`,
          };
        } else if (selectedRole === "recruiter") {
          payload.companyName = companyName;
          payload.location = location;
        } else if (selectedRole === "placementOfficer") {
          payload.officerPasscode = officerPasscode;
        } else if (selectedRole === "admin") {
          payload.adminPasscode = adminPasscode;
        }

        setSuccessMessage(`Account created for ${name}. Logging you in...`);
        const { user } = await apiRegister(payload);
        setTimeout(() => onLoginSuccess(user), 800);
      } else {
        const { user } = await apiLogin(email, password);
        if (user.role !== selectedRole) {
          setErrorMessage(`This account is registered as ${user.role}, not ${selectedRole}.`);
          return;
        }
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
          <BorderGlow borderRadius={24} className="bg-white p-6 md:p-8 shadow-sm border border-neutral-200/50">
            {/* Tab selection for Sign In / Sign Up */}
            <div className="flex bg-neutral-100 p-1.5 rounded-full mb-6">
              <button
                type="button"
                onClick={() => handleModeChange("signin")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-mono font-extrabold rounded-full transition-all ${
                  authMode === "signin"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
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
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                CREATE ACCOUNT
              </button>
            </div>

            <div className="mb-6 text-center">
              <h2 className="text-xl font-serif font-bold text-slate-800">
                {authMode === "signin" ? "Access PlacePro AI Gateway" : "Register Your Campus Role"}
              </h2>
              <p className="text-xs text-neutral-400 mt-1.5">
                {authMode === "signin" 
                  ? "Select your operational role and input credentials." 
                  : "Pick your portal path and create a functional record profile."}
              </p>
            </div>

            {/* Role Tab bar */}
            <div className="flex justify-around gap-2 p-1 bg-neutral-50 rounded-xl mb-6 border border-neutral-100">
              <button
                type="button"
                onClick={() => handleRoleChange("student")}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                  selectedRole === "student"
                    ? "bg-white border border-neutral-200 text-emerald-800 font-semibold"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase">Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("recruiter")}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                  selectedRole === "recruiter"
                    ? "bg-white border border-neutral-200 text-indigo-800 font-semibold"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase">Recruiter</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("placementOfficer")}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                  selectedRole === "placementOfficer"
                    ? "bg-white border border-neutral-200 text-rose-800 font-semibold"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase">Officer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("admin")}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                  selectedRole === "admin"
                    ? "bg-white border border-neutral-200 text-amber-800 font-semibold"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase">Admin</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3.5 text-xs font-semibold mb-6 flex items-start gap-2.5 animate-shake">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 text-xs font-semibold mb-6 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {authMode === "signup" && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-extrabold tracking-wider text-slate-600 uppercase">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="e.g. Vikram Singh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400 focus:bg-white"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono font-extrabold tracking-wider text-slate-600 uppercase">
                  College / Professional Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    placeholder="e.g. student@collegetech.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono font-extrabold tracking-wider text-slate-600 uppercase">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Dynamic signup subforms based on selected role */}
              {authMode === "signup" && selectedRole === "student" && (
                <div className="border-t border-neutral-100 pt-4 mt-2 flex flex-col gap-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-extrabold tracking-wider text-slate-600 uppercase">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-extrabold tracking-wider text-slate-600 uppercase">
                        Current CGPA
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        max="10"
                        min="0"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-extrabold tracking-wider text-slate-600 uppercase">
                        Academic Degree
                      </label>
                      <select
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl"
                      >
                        <option value="B.Tech">B.Tech</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="MCA">MCA</option>
                        <option value="BCA">BCA</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-extrabold tracking-wider text-slate-600 uppercase">
                        Branch / Major
                      </label>
                      <input
                        type="text"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono font-extrabold tracking-wider text-slate-600 uppercase">
                      LinkedIn URL
                    </label>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono font-extrabold tracking-wider text-slate-600 uppercase">
                      GitHub URL
                    </label>
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {authMode === "signup" && selectedRole === "recruiter" && (
                <div className="border-t border-neutral-100 pt-4 mt-2 flex flex-col gap-4 animate-fade-in">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono font-extrabold tracking-wider text-slate-600 uppercase">
                      Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Netflix India"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono font-extrabold tracking-wider text-slate-600 uppercase">
                      Hiring Headquarters Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai (Onsite)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {authMode === "signup" && selectedRole === "placementOfficer" && (
                <div className="border-t border-neutral-100 pt-4 mt-2 flex flex-col gap-4 animate-fade-in">
                  <div className="flex flex-col gap-1 bg-[#FAFAF5] p-3 rounded-lg border border-neutral-200/50">
                    <div className="flex items-center gap-1 text-emerald-800 font-mono text-[10px] uppercase font-bold mb-1">
                      <Info className="w-3.5 h-3.5 text-emerald-700" />
                      Coordinator Office Credentials Required
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed mb-2">
                      Please enter the authorization passkey issued by the college board. (Demo key: <code className="font-mono bg-neutral-200 px-1 rounded text-[#222]">CAMPUS2026</code>)
                    </p>
                    <input
                      type="password"
                      placeholder="Enter Campus passkey"
                      value={officerPasscode}
                      onChange={(e) => setOfficerPasscode(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-xl"
                      required
                    />
                  </div>
                </div>
              )}

              {authMode === "signup" && selectedRole === "admin" && (
                <div className="border-t border-neutral-100 pt-4 mt-2 flex flex-col gap-4 animate-fade-in">
                  <div className="flex flex-col gap-1 bg-[#FAFAF5] p-3 rounded-lg border border-neutral-200/50">
                    <div className="flex items-center gap-1 text-amber-800 font-mono text-[10px] uppercase font-bold mb-1">
                      <Info className="w-3.5 h-3.5 text-amber-700" />
                      Root Admin Credentials Required
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed mb-2">
                      Enter the master root password to spin up administrator authority. (Demo key: <code className="font-mono bg-neutral-200 px-1 rounded text-[#222]">ADMINROOT</code>)
                    </p>
                    <input
                      type="password"
                      placeholder="Enter Root master key"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-xl"
                      required
                    />
                  </div>
                </div>
              )}

              <ShimmerButton type="submit" disabled={isSubmitting} className="py-3 px-8 text-sm w-full mt-2 font-mono uppercase font-black">
                {isSubmitting ? "Please wait..." : authMode === "signin" ? `Sign In as ${selectedRole}` : `Complete ${selectedRole} Registration`}
              </ShimmerButton>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-center text-xs text-neutral-500 hover:text-neutral-800 py-1"
                >
                  Cancel and Return
                </button>
              )}
            </form>
          </BorderGlow>
        </div>

        {/* Right column: Quick demo login card dashboard */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="bg-[#FAF9F3] p-5 rounded-3xl border border-neutral-200 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-slate-800 font-serif font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>One-Click Testing Accounts</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              We pre-loaded test database users mapping each specialized dashboard framework role. Select a credentials pill below to log in instantly.
            </p>

            <div className="flex flex-col gap-3 mt-1">
              
              {/* Students quickies */}
              <div>
                <span className="text-[9px] font-mono font-bold tracking-wider text-neutral-400 uppercase">STUDENTS (PRE-LOADED PROFILES)</span>
                <div className="flex flex-col gap-2 mt-1.5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => triggerDemoLogin("aarav")}
                    className="flex items-center justify-between p-2 text-xs bg-white hover:bg-neutral-100/50 border border-neutral-200 rounded-xl transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                        AS
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">Aarav Sharma</div>
                        <div className="text-[9px] text-neutral-400 font-mono">B.Tech CSE (Verified)</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-neutral-400 mr-1" />
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => triggerDemoLogin("aditi")}
                    className="flex items-center justify-between p-2 text-xs bg-white hover:bg-neutral-100/50 border border-neutral-200 rounded-xl transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                        AI
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">Aditi Iyer</div>
                        <div className="text-[9px] text-neutral-400 font-mono">B.Tech IT (Pending)</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-neutral-400 mr-1" />
                  </button>
                </div>
              </div>

              {/* Recruiter quickies */}
              <div className="pt-2 border-t border-neutral-200/50">
                <span className="text-[9px] font-mono font-bold tracking-wider text-neutral-400 uppercase">RECRUITERS</span>
                <div className="flex flex-col gap-2 mt-1.5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => triggerDemoLogin("google")}
                    className="flex items-center justify-between p-2 text-xs bg-white hover:bg-neutral-100/50 border border-neutral-200 rounded-xl transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold text-[10px]">
                        G
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">Google India</div>
                        <div className="text-[9px] text-neutral-400 font-mono">Company recruiter</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-neutral-400 mr-1" />
                  </button>
                </div>
              </div>

              {/* Placement Officer & Root Admin */}
              <div className="pt-2 border-t border-neutral-200/50">
                <span className="text-[9px] font-mono font-bold tracking-wider text-neutral-400 uppercase">FINANCIALS / AUTHORITY</span>
                <div className="flex flex-col gap-2 mt-1.5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => triggerDemoLogin("officer")}
                    className="flex items-center justify-between p-2 text-xs bg-white hover:bg-neutral-100/50 border border-neutral-200 rounded-xl transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-800 flex items-center justify-center font-bold text-[10px]">
                        PO
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">Prof. Rajesh Mehra</div>
                        <div className="text-[9px] text-neutral-400 font-mono">Placement Coordinator</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-neutral-400 mr-1" />
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => triggerDemoLogin("admin")}
                    className="flex items-center justify-between p-2 text-xs bg-white hover:bg-neutral-100/50 border border-neutral-200 rounded-xl transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-[10px]">
                        AD
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">System Admin</div>
                        <div className="text-[9px] text-neutral-400 font-mono">Full Platform Audit</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-neutral-400 mr-1" />
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
