import { useState, useEffect, useCallback } from "react";
import { 
  Sparkles, Shield, CheckCircle2, Briefcase, GraduationCap, Users,
  Lock, LogOut, ArrowLeftRight, AlertTriangle,
  Home, Menu, X, Sun, Moon, Target, TrendingUp
} from "lucide-react";
import { useTheme } from "./hooks/useTheme";
import Logo from "./components/Logo";
import VideoText from "./components/VideoText";
import ShimmerButton from "./components/ShimmerButton";
import StudentPortal from "./components/StudentPortal";
import RecruiterPortal from "./components/RecruiterPortal";
import PlacementOfficerPortal from "./components/PlacementOfficerPortal";
import AdminPortal from "./components/AdminPortal";
import BorderGlow from "./components/BorderGlow";
import AuthPage from "./components/AuthPage";
import Interactive3DHero from "./components/Interactive3DHero";
import { useAuth } from "./hooks/useAuth";
import { usePlatformData } from "./hooks/usePlatformData";
import * as studentsApi from "./api/students";
import * as jobsApi from "./api/jobs";
import * as applicationsApi from "./api/applications";
import * as drivesApi from "./api/drives";
import * as mockApi from "./api/mockInterviews";
import * as adminApi from "./api/admin";
import { login as apiLogin } from "./api/auth";
import { StudentProfile, Job, Application, PlacementDrive, MockInterviewResult, UserRole } from "./types";

const DEMO_ACCOUNTS: Record<UserRole, { email: string; password: string }> = {
  student: { email: "aarav.sharma@collegetech.edu", password: "password123" },
  recruiter: { email: "recruitment@google.com", password: "password123" },
  placementOfficer: { email: "placement.officer@collegetech.edu", password: "password123" },
  admin: { email: "admin.root@collegetech.edu", password: "password123" },
};

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, setCurrentUser, logout, isLoading: authLoading } = useAuth();
  const {
    students: studentsByState,
    jobs: jobsByState,
    applications: applicationsByState,
    drives: drivesByState,
    mockInterviews: mockInterviewsByState,
    studentProfile,
    isLoading: dataLoading,
    refreshAll,
    setStudentProfile,
    setApplications,
    setJobs,
    setDrives,
    setMockInterviews,
    setStudents,
  } = usePlatformData(currentUser);

  const [users, setUsers] = useState<adminApi.AdminUser[]>([]);

  const fetchAllUsers = useCallback(async () => {
    if (currentUser?.role === "admin") {
      try {
        const u = await adminApi.fetchAllUsers();
        setUsers(u);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchAllUsers();
    }
  }, [currentUser, fetchAllUsers]);

const [activePortalIndex, setActivePortalIndex] = useState<number>(() => {
  const savedPortal = localStorage.getItem("activePortalIndex");

  if (savedPortal) {
    return Number(savedPortal);
  }

  const savedUser = localStorage.getItem("placely_cur_user");

  if (savedUser) {
    const user = JSON.parse(savedUser);

    switch (user.role) {
      case "student":
        return 1;

      case "recruiter":
        return 2;

      case "placementOfficer":
        return 3;

      case "admin":
        return 4;

      default:
        return 0;
    }
  }

  return 0;
});
useEffect(() => {
  localStorage.setItem(
    "activePortalIndex",
    activePortalIndex.toString()
  );
}, [activePortalIndex]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) refreshAll();
  }, [currentUser, refreshAll]);

  const loggedInStudent = studentProfile || studentsByState.find(s => s.id === currentUser?.id) || studentsByState[0];

  // Map gooey navigation indices to core routing state
  const portalRoles = ["home", "student", "recruiter", "officer", "admin"] as const;
  const currentRole = portalRoles[activePortalIndex];

  // Map portal roles to system expectations for alignment screens
  const getRoleLabel = (role: UserRole) => {
    switch(role) {
      case "student": return "Candidate Student";
      case "recruiter": return "Corporate Recruiter";
      case "placementOfficer": return "Placement Officer";
      case "admin": return "System Administrator";
    }
  };

  const handleUpdateStudentProfile = async (editedProfile: StudentProfile) => {
    const updated = await studentsApi.updateMyProfile(editedProfile);
    setStudentProfile(updated);
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleApplyJob = async (jobId: string) => {
    const duplicate = applicationsByState.find(app => app.jobId === jobId && app.studentId === loggedInStudent?.id);
    if (duplicate) return;
    try {
      await applicationsApi.applyToJob(jobId);
      await refreshAll();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to apply to job");
    }
  };

  const handleRequestVerification = async () => {
    const updated = await studentsApi.requestVerification();
    setStudentProfile(updated);
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleSaveMockInterviewResult = async (result: MockInterviewResult) => {
    const saved = await mockApi.saveMockInterview(result);
    setMockInterviews(prev => [...prev, saved]);
    await refreshAll();
  };

  const handleCreateJob = async (newJob: Job) => {
    await jobsApi.createJob(newJob);
    await refreshAll();
  };

  const handleUpdateJob = async (editedJob: Job) => {
    await jobsApi.updateJob(editedJob.id, editedJob);
    await refreshAll();
  };

  const handleDeleteJob = async (jobId: string) => {
    await jobsApi.deleteJob(jobId);
    await refreshAll();
  };

  const handleUpdateApplicationStatus = async (appId: string, status: Application["status"]) => {
    const mock = mockInterviewsByState.find(m => {
      const app = applicationsByState.find(a => a.id === appId);
      return app && m.studentId === app.studentId;
    });
    await applicationsApi.updateApplicationStatus(appId, status, {
      interviewScore: status === "MockAssigned" && mock ? mock.totalScore : undefined,
    });
    await refreshAll();
  };

  const handleVerifyStudent = async (studentId: string, status: "Verified" | "Rejected", remarks?: string) => {
    await studentsApi.verifyStudent(studentId, status, remarks);
    await refreshAll();
  };

  const handleVerifyJob = async (jobId: string, status: "Approved" | "Rejected", remarks?: string) => {
    await jobsApi.verifyJob(jobId, status, remarks);
    await refreshAll();
  };

  const handleAddDrive = async (newDrive: PlacementDrive) => {
    await drivesApi.createDrive(newDrive);
    await refreshAll();
  };

  const handleDeleteDrive = async (driveId: string) => {
    await drivesApi.deleteDrive(driveId);
    await refreshAll();
  };

  const handleDeleteStudent = async (studentId: string) => {
    await studentsApi.deleteStudent(studentId);
    await refreshAll();
  };

  const handleGrantVerification = async (studentId: string) => {
    await studentsApi.grantVerification(studentId);
    await refreshAll();
  };

  const handleCreateUserByAdmin = async (payload: any) => {
    await adminApi.createUserByAdmin(payload);
    await fetchAllUsers();
    await refreshAll();
  };

  const handleDeleteUserByAdmin = async (userId: string) => {
    if (confirm("Are you sure you want to permanently delete this user account?")) {
      await adminApi.deleteUserByAdmin(userId);
      await fetchAllUsers();
      await refreshAll();
    }
  };


  const handleClearCache = async () => {
    await adminApi.resetPlatform();
    logout();
    setActivePortalIndex(0);
    alert("Platform data reset. Run `npm run seed` in the backend folder to repopulate demo data.");
  };

  const handleLogout = () => {
    logout();
    setActivePortalIndex(0);
  };

  const switchToDemoRole = useCallback(async (role: UserRole) => {
    const creds = DEMO_ACCOUNTS[role];
    const { user } = await apiLogin(creds.email, creds.password);
    setCurrentUser(user);
  }, [setCurrentUser]);

  const navItems = [
    { label: "Home Base", id: "home", icon: Home },
    { label: "Student Portal", id: "student", icon: GraduationCap },
    { label: "Corporate Recruiter", id: "recruiter", icon: Briefcase },
    { label: "Placement Officer", id: "officer", icon: Users },
    { label: "Root Admin", id: "admin", icon: Shield }
  ];

  // Map the navigation index to matching UserRole key
  const routeRoleMapping: Record<string, UserRole> = {
    "student": "student",
    "recruiter": "recruiter",
    "officer": "placementOfficer",
    "admin": "admin"
  };

  // Check auth validations
  const isGuest = currentUser === null;
  const isCorrectRole = currentRole === "home" || (currentUser && routeRoleMapping[currentRole] === currentUser.role);
  // Helper avatar colors
  const getUserBgClass = (role: UserRole) => {
    switch(role) {
      case "student": return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "recruiter": return "bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]";
      case "placementOfficer": return "bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]";
      case "admin": return "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]";
    }
  };

  return (
    <div className="min-h-screen w-full placement-gradient font-sans text-theme-primary selection:bg-indigo-500/20 selection:text-indigo-200 pb-16 flex flex-col items-center relative overflow-x-hidden">
      {/* Background Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-40 z-0" />
      
      {/* Top Professional Sticky Responsive Header */}
     <header className="w-full sticky top-0 z-50 backdrop-blur-2xl border-b border-theme shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] px-4 transition-all duration-300" style={{ background: "var(--header-bg)" }}>
  <div className="w-full max-w-7xl mx-auto py-3 flex items-center justify-between gap-4">
    
    {/* 1. Logo Section */}
    <div className="flex-shrink-0 hover:opacity-90 transition-opacity cursor-pointer">
      <Logo showText={true} />
    </div>

    {/* 2. Desktop Portal Navigation */}
    <nav className="hidden md:flex items-center justify-center flex-1 gap-1">
      {navItems.map((item, idx) => {
        // If guest, show only Home Base and the Student Portal tab (which we rename to "Secure Login" for guests)
        if (!currentUser) {
          if (idx !== 0 && idx !== 1) return null;
        } else {
          // If logged in, show only Home Base and their active portal tab
          const userRole = currentUser.role;
          const targetRole = routeRoleMapping[item.id];
          if (idx !== 0 && targetRole !== userRole) return null;
        }

        const IconComp = item.icon;
        const isActive = activePortalIndex === idx;
        const labelText = !currentUser && idx === 1 ? "Secure Login" : item.label;

        return (
          <button
            key={item.id}
            onClick={() => setActivePortalIndex(idx)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${
              isActive
                ? "bg-white/20 text-white border border-white/30"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <IconComp className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : ""}`} />
            <span className="hidden lg:inline">{labelText}</span>
          </button>
        );
      })}
    </nav>

    {/* 3. Current Role Identity Bar, Login Control, & Mobile Menu Button */}
    <div className="flex items-center justify-end gap-3 flex-shrink-0">

      <button
        onClick={toggleTheme}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="p-2.5 text-slate-300 hover:text-white bg-white/10 ring-1 ring-white/10 hover:ring-white/30 rounded-full transition-all duration-300"
      >
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {currentUser ? (
        <div className="flex items-center gap-2.5 bg-white/10 pl-1.5 pr-2 py-1.5 rounded-full ring-1 ring-white/10 shadow-sm hover:shadow-md hover:ring-white/20 transition-all duration-300 max-w-[210px] md:max-w-none group">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase tracking-wider shrink-0 shadow-inner ${getUserBgClass(currentUser.role)}`}>
            {currentUser.name.substring(0, 2)}
          </div>
          <div className="hidden md:flex flex-col text-left pr-1">
            <span className="text-[11px] font-bold text-white leading-tight tracking-tight">
              {currentUser.name}
            </span>
            <span className="text-[9px] font-mono font-semibold uppercase text-slate-300 tracking-wider mt-0.5">
              {currentUser.role === "recruiter" && currentUser.companyName ? currentUser.companyName : getRoleLabel(currentUser.role)}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out transition"
            className="p-1.5 text-slate-350 hover:text-rose-400 hover:bg-white/10 rounded-full transition-all duration-200 shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setActivePortalIndex(1);
            setMobileMenuOpen(false);
          }}
          className="group flex items-center gap-2 text-xs font-semibold text-white bg-indigo-650 px-5 py-2.5 rounded-full shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:bg-indigo-600 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 border border-white/10"
        >
          <Lock className="w-3.5 h-3.5 text-white/70 group-hover:text-emerald-400 transition-colors duration-300" />
          <span className="tracking-wide">Portal Login</span>
        </button>
      )}

      {/* Mobile / Tablet Menu Hamburger */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2.5 text-slate-300 hover:text-white bg-white/10 ring-1 ring-white/10 hover:ring-white/20 hover:bg-white/15 rounded-full shadow-sm transition-all duration-300 active:scale-95 cursor-pointer"
        aria-label="Toggle navigation"
      >
        {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>
    </div>
  </div>

  {/* 4. Mobile menu dropdown panel */}
  {mobileMenuOpen && (
    <div className="md:hidden absolute left-0 right-0 top-full backdrop-blur-2xl border-b border-theme shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] px-4 py-5 flex flex-col gap-1.5 z-50 transform transition-all duration-300 origin-top" style={{ background: "var(--header-bg)" }}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
        Menu
      </span>
      {navItems.map((item, idx) => {
        // If guest, show only Home Base and the Student Portal tab (which we rename to "Secure Login" for guests)
        if (!currentUser) {
          if (idx !== 0 && idx !== 1) return null;
        } else {
          // If logged in, show only Home Base and their active portal tab
          const userRole = currentUser.role;
          const targetRole = routeRoleMapping[item.id];
          if (idx !== 0 && targetRole !== userRole) return null;
        }

        const IconComp = item.icon;
        const isActive = activePortalIndex === idx;
        const labelText = !currentUser && idx === 1 ? "Secure Login" : item.label;

        return (
          <button
            key={item.id}
            onClick={() => {
              setActivePortalIndex(idx);
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 text-left text-sm font-semibold px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              isActive 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-[1.01]" 
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <IconComp className={`w-4 h-4 transition-colors ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
            <span className="flex-1 tracking-wide">{labelText}</span>
            {isActive && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.8)]" />}
          </button>
        );
      })}
      
      {/* Display active state of user in mobile drawer */}
      {currentUser && (
        <div className="mt-4 pt-5 border-t border-white/10 flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm uppercase tracking-wider shadow-inner ${getUserBgClass(currentUser.role)}`}>
              {currentUser.name.substring(0, 2)}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white tracking-tight">{currentUser.name}</span>
              <span className="text-[10px] font-mono font-semibold text-slate-400 mt-0.5">{getRoleLabel(currentUser.role)}</span>
            </div>
          </div>
          <button
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold text-rose-450 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all duration-300"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )}
</header>

      {/* Main Container Wrapper */}
      <main className="w-full max-w-7xl px-4 mt-8 flex-1 z-10 relative">

        {/* TAB 1: LANDING HUB */}
        {currentRole === "home" && (
          <div className="flex flex-col gap-12">
            
            {/* Elegant Hero Heading using VideoText */}
            <div className="text-center flex flex-col items-center max-w-4xl mx-auto mt-6">
             
              
              <h1 className="sr-only">AI Placement Drive Ecosystem</h1>
              
              <VideoText 
                src="https://cdn.magicui.design/ocean-small.webm"
                fontSize={15}
                fontWeight="black"
                fontFamily="Georgia, serif"
                className="w-full h-[150px] md:h-[220px]"
              >
                PLACEPRO AI
              </VideoText>

              {/* Interactive 3D Crystal Hero Visual */}
              <Interactive3DHero />

              <p className="font-serif text-lg md:text-xl text-theme-secondary leading-relaxed mt-6 max-w-2xl px-4">
                Your campus placement command center — AI-powered resume audits, mock interviews, and job matching powered by Groq. Built for students chasing their dream offer.
              </p>

              <div className="flex flex-wrap gap-4 mt-8 justify-center">
                {!currentUser ? (
                  <ShimmerButton 
                    onClick={() => {
                      // Redirect to unified login page
                      setActivePortalIndex(1);
                    }}
                    background="linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)"
                    shimmerColor="#ffffff"
                    className="py-3 px-8 text-sm border-none shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_25px_rgba(79,70,229,0.5)] font-semibold"
                  >
                    Access Secure Portal
                  </ShimmerButton>
                ) : (
                  <ShimmerButton 
                    onClick={() => {
                      // Redirect to logged-in user's active portal
                      switch (currentUser.role) {
                        case "student": setActivePortalIndex(1); break;
                        case "recruiter": setActivePortalIndex(2); break;
                        case "placementOfficer": setActivePortalIndex(3); break;
                        case "admin": setActivePortalIndex(4); break;
                        default: setActivePortalIndex(0);
                      }
                    }}
                    background="linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)"
                    shimmerColor="#ffffff"
                    className="py-3 px-8 text-sm border-none shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_25px_rgba(79,70,229,0.5)] font-semibold"
                  >
                    Go to My Dashboard
                  </ShimmerButton>
                )}
              </div>
            </div>

            {/* Feature Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Feature 1 */}
              <BorderGlow 
                borderRadius={20}
                className="p-6 md:p-8 hover:shadow-xl transition-all border border-theme"
                backgroundColor="var(--bg-card)"
                colors={["#4F46E5", "#8B5CF6", "#3B82F6"]}
                glowColor="244 76 54"
                fillOpacity={0.08}
              >
                <div className="w-10 h-10 bg-indigo-500/15 text-indigo-400 rounded-xl flex items-center justify-center mb-4 border border-indigo-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-md font-bold text-theme-primary mb-2">AI Resume Analyzer</h3>
                <p className="text-xs text-theme-secondary leading-relaxed">
                  Groq-powered ATS scoring against real job descriptions. Detect skill gaps, get keyword suggestions, and boost your placement readiness score.
                </p>
              </BorderGlow>

              <BorderGlow 
                borderRadius={20}
                className="p-6 md:p-8 hover:shadow-xl transition-all border border-theme"
                backgroundColor="var(--bg-card)"
                colors={["#8B5CF6", "#4F46E5", "#EC4899"]}
                glowColor="258 95 66"
                fillOpacity={0.08}
              >
                <div className="w-10 h-10 bg-purple-500/15 text-purple-400 rounded-xl flex items-center justify-center mb-4 border border-purple-500/20">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-md font-bold text-theme-primary mb-2">Mock Interview Prep</h3>
                <p className="text-xs text-theme-secondary leading-relaxed">
                  Practice technical, HR, and behavioral rounds with AI-generated questions. Get detailed feedback and grades before the real campus drive.
                </p>
              </BorderGlow>

              <BorderGlow 
                borderRadius={20}
                className="p-6 md:p-8 hover:shadow-xl transition-all border border-theme"
                backgroundColor="var(--bg-card)"
                colors={["#3B82F6", "#10B981", "#4F46E5"]}
                glowColor="217 91 60"
                fillOpacity={0.08}
              >
                <div className="w-10 h-10 bg-blue-500/15 text-blue-400 rounded-xl flex items-center justify-center mb-4 border border-blue-500/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-md font-bold text-theme-primary mb-2">Placement Pipeline</h3>
                <p className="text-xs text-theme-secondary leading-relaxed">
                  Students apply to verified jobs, officers approve profiles, recruiters shortlist candidates — one connected ecosystem for campus placements.
                </p>
              </BorderGlow>
            </div>

            {/* Quick Metrics SVG Diagram Block */}
            <div className="placement-card rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 py-1 px-3 rounded-full">
                  Student Placement Stats
                </span>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-theme-primary mt-4 leading-snug">
                  From campus to corporate — your placement journey starts here.
                </h2>
                <p className="text-xs text-theme-secondary mt-2 max-w-lg leading-relaxed">
                  Build your profile, get verified by placement officers, practice with AI mock interviews, and apply to top company drives — all in one platform.
                </p>
              </div>

              <div className="w-full md:w-auto shrink-0 flex gap-4">
                <div className="bg-theme-elevated p-5 rounded-2xl border border-theme text-center flex flex-col items-center">
                  <span className="text-3xl font-serif font-black text-emerald-400">120+</span>
                  <span className="text-[10px] text-theme-secondary font-mono uppercase tracking-wider mt-1">Active Students</span>
                </div>
                <div className="bg-theme-elevated p-5 rounded-2xl border border-theme text-center flex flex-col items-center">
                  <span className="text-3xl font-serif font-black text-emerald-400">₹12 L</span>
                  <span className="text-[10px] text-theme-secondary font-mono uppercase tracking-wider mt-1">Avg Package</span>
                </div>
                <div className="bg-theme-elevated p-5 rounded-2xl border border-theme text-center flex flex-col items-center">
                  <span className="text-3xl font-serif font-black text-emerald-400">92%</span>
                  <span className="text-[10px] text-theme-secondary font-mono uppercase tracking-wider mt-1">Hire Rate</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY GATE 1: GUEST SELECTS A PORTAL -> PROMPT AUTH */}
        {currentRole !== "home" && isGuest && (
          <div className="flex flex-col gap-6 animate-fade-in py-4">
    

          <AuthPage
  onLoginSuccess={(session) => {
    console.log("LOGIN SUCCESS:", session);

    setCurrentUser(session);

    // Auto-open correct portal after login
    switch (session.role) {
      case "student":
        setActivePortalIndex(1);
        break;

      case "recruiter":
        setActivePortalIndex(2);
        break;

      case "placementOfficer":
        setActivePortalIndex(3);
        break;

      case "admin":
        setActivePortalIndex(4);
        break;

      default:
        setActivePortalIndex(0);
    }

    refreshAll();
  }}
  initialRoleTab={routeRoleMapping[currentRole]}
/>
          </div>
        )}

        {/* SECURITY GATE 2: USER LOGGED IN BUT CLICKS A DIFFERENT PORTAL TAB */}
        {currentRole !== "home" && !isGuest && !isCorrectRole && (
          <div className="flex flex-col items-center justify-center max-w-2xl mx-auto text-center py-12 px-4 animate-fade-in">
            <BorderGlow 
              borderRadius={32} 
              className="p-8 shadow-xl w-full flex flex-col items-center border border-theme"
              backgroundColor="var(--bg-card)"
              colors={["#EF4444", "#F59E0B", "#4F46E5"]}
              glowColor="0 84 60"
              fillOpacity={0.08}
            >
              <div className="w-16 h-16 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8" />
              </div>
              
              <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full py-1 px-3 text-[10px] font-mono tracking-widest font-extrabold uppercase">
                Active Session Conflict
              </span>

              <h2 className="font-serif text-2xl font-bold text-theme-primary mt-4 leading-tight">
                Authorized Role Conflict
              </h2>

              <p className="text-sm text-theme-secondary mt-3 leading-relaxed max-w-md">
                You are currently signed in as <strong className="text-theme-primary font-bold">{currentUser.name}</strong> ({getRoleLabel(currentUser.role)}). 
                To open the <strong className="capitalize text-theme-primary">{currentRole} portal</strong>, you can switch mode below or log out.
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 mt-8 w-full">
                <button
                  onClick={() => switchToDemoRole(routeRoleMapping[currentRole])}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border border-theme hover:bg-theme-card text-xs font-semibold rounded-full transition active:scale-95 text-theme-secondary hover:text-indigo-400 hover:border-indigo-500/30"
                >
                  <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
                  Auto-switch to {getRoleLabel(routeRoleMapping[currentRole])}
                </button>

                <button
                  onClick={handleLogout}
                  className="flex-1 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono tracking-wider uppercase rounded-full shadow-md transition active:scale-95"
                >
                  Logout Current Session
                </button>
              </div>

              <button
                onClick={() => setActivePortalIndex(0)} // Return to home safely
                className="text-xs text-theme-muted hover:text-theme-primary font-medium underline mt-6 underline-offset-4"
              >
                Or, return safe to Landing Hub base
              </button>
            </BorderGlow>
          </div>
        )}

        {/* SECURITY GATE 3: RENDER THE CORRECT MODULES ONCE VERIFIED AND ALIGNED */}
        {!isGuest && isCorrectRole && (authLoading || dataLoading) && !loggedInStudent && currentRole === "student" && (
          <div className="text-center py-12 text-xs text-neutral-400 font-mono animate-pulse">Loading portal data...</div>
        )}

        {!isGuest && isCorrectRole && !(currentRole === "student" && dataLoading && !loggedInStudent) && (
          <div className="animate-fade-in">
            {/* TAB 2: STUDENT PORTAL PANEL */}
            {currentRole === "student" && loggedInStudent && (
              <StudentProfilePortalWrapper 
                profile={loggedInStudent}
                jobs={jobsByState}
                applications={applicationsByState}
                mockInterviews={mockInterviewsByState}
                onUpdateProfile={handleUpdateStudentProfile}
                onApplyJob={handleApplyJob}
                onSaveMockResult={handleSaveMockInterviewResult}
                onRequestVerification={handleRequestVerification}
              />
            )}

            {/* TAB 3: RECRUITER PORTAL PANEL */}
            {currentRole === "recruiter" && (
              <RecruiterPortal 
                jobs={jobsByState}
                applications={applicationsByState}
                students={studentsByState}
                recruiterId={currentUser.id}
                recruiterName={currentUser.companyName || currentUser.name}
                onCreateJob={handleCreateJob}
                onUpdateJob={handleUpdateJob}
                onDeleteJob={handleDeleteJob}
                onUpdateApplicationStatus={handleUpdateApplicationStatus}
              />
            )}

            {/* TAB 4: PLACEMENT OFFICER PANEL */}
            {currentRole === "officer" && (
              <PlacementOfficerPortal 
                students={studentsByState}
                jobs={jobsByState}
                drives={drivesByState}
                onVerifyStudent={handleVerifyStudent}
                onVerifyJob={handleVerifyJob}
                onAddDrive={handleAddDrive}
                onDeleteDrive={handleDeleteDrive}
              />
            )}

            {/* TAB 5: ADMIN PORTAL PANEL */}
            {currentRole === "admin" && (
              <AdminPortal 
                students={studentsByState}
                jobs={jobsByState}
                applications={applicationsByState}
                onDeleteStudent={handleDeleteStudent}
                onGrantVerification={handleGrantVerification}
                onClearCache={handleClearCache}
                users={users}
                onDeleteUser={handleDeleteUserByAdmin}
                onCreateUser={handleCreateUserByAdmin}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Subwrapper to encapsulate StudentPortal cleanly
function StudentProfilePortalWrapper({
  profile,
  jobs,
  applications,
  mockInterviews,
  onUpdateProfile,
  onApplyJob,
  onSaveMockResult,
  onRequestVerification
}: {
  profile: StudentProfile;
  jobs: Job[];
  applications: Application[];
  mockInterviews: MockInterviewResult[];
  onUpdateProfile: (updated: StudentProfile) => void;
  onApplyJob: (jobId: string) => void;
  onSaveMockResult: (result: MockInterviewResult) => void;
  onRequestVerification: () => Promise<void>;
}) {
  return (
    <StudentPortal 
      profile={profile}
      jobs={jobs}
      applications={applications}
      mockInterviews={mockInterviews}
      onUpdateProfile={onUpdateProfile}
      onApplyJob={onApplyJob}
      onSaveMockResult={onSaveMockResult}
      onRequestVerification={onRequestVerification}
    />
  );
}

