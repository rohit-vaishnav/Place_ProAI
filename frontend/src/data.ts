import { StudentProfile, Job, Application, PlacementDrive, MockInterviewResult } from "./types";

export const initialStudents: StudentProfile[] = [
  {
    id: "stud_1",
    name: "Aarav Sharma",
    email: "aarav.sharma@collegetech.edu",
    phone: "+91 98765 43210",
    linkedin: "https://linkedin.com/in/aaravsharma-link",
    github: "https://github.com/aaravsharma-git",
    skills: ["React", "Node.js", "Express", "MongoDB", "JavaScript", "HTML/CSS", "Python"],
    projects: [
      {
        name: "Campus Security System",
        desc: "An IoT and web dashboard allowing security teams to monitor gates and entry logs in real-time.",
        tech: "React, Node, Socket.io"
      },
      {
        name: "E-Commerce Microservice",
        desc: "Designed checkout API supporting Stripe payment gateway with 99.9% uptime compliance.",
        tech: "Express, PostgreSQL, Redis"
      }
    ],
    certifications: ["AWS Certified Developer Associate", "MongoDB Associate Developer"],
    resumeText: `AARAV SHARMA - Full-Stack Developer
aarav.sharma@collegetech.edu | +91 98765 43210
SKILLS: React.js, Express.js, TypeScript, Node.js, SQL, MongoDB, Python, Git.
PROJECTS: 
1. Real-time Security System: Built a websocket dashboard monitoring campus entry pathways.
2. Microservice E-commerce backend: Built payment gateway APIs processing checkout events.
EDUCATION: B.Tech in Computer Science - College Tech (CGPA: 8.9 / 10)`,
    academic: {
      degree: "B.Tech",
      major: "Computer Science",
      institution: "State Engineering College",
      graduationYear: "2026",
      cgpa: "8.9"
    },
    verificationStatus: "Verified",
    resumeScore: 82,
    atsScore: 78,
    readinessScore: 85
  },
  {
    id: "stud_2",
    name: "Aditi Iyer",
    email: "aditi.iyer@collegetech.edu",
    phone: "+91 87654 32109",
    linkedin: "https://linkedin.com/in/aditi-iyer-link",
    github: "https://github.com/aditiiyer-coder",
    skills: ["Python", "Machine Learning", "Pandas", "Scikit-Learn", "Java", "SQL", "HTML/CSS"],
    projects: [
      {
        name: "Predictive Crop Visualizer",
        desc: "ML-based web portal advising local state farmers on season crop yield statistics using soil sensors.",
        tech: "Python, Flask, Random Forest Classifier"
      }
    ],
    certifications: ["TensorFlow Developer Specialized Certificate", "Coursera Deep Learning.AI"],
    resumeText: `ADITI IYER - ML Engineer Aspirant
aditi.iyer@collegetech.edu
SKILLS: Python, TensorFlow, SQL, Flask, Pandas, Java, Scikit-Learn.
PROJECTS: Crop Yield Predictor: Built weather classification models predicting soil productivity outputs in 94% accuracy.
EDUCATION: B.Tech in Information Technology - College Tech (CGPA: 9.2 / 10)`,
    academic: {
      degree: "B.Tech",
      major: "Information Technology",
      institution: "State Engineering College",
      graduationYear: "2026",
      cgpa: "9.2"
    },
    verificationStatus: "Pending",
    resumeScore: 75,
    atsScore: 72,
    readinessScore: 80
  },
  {
    id: "stud_3",
    name: "Rohan Verma",
    email: "rohan.v@collegetech.edu",
    phone: "+91 76543 21098",
    linkedin: "https://linkedin.com/in/rohanverma",
    github: "https://github.com/rohanverma-dev",
    skills: ["Java", "Spring Boot", "SQL", "Docker", "REST APIs", "C++"],
    projects: [
      {
        name: "Library Micro-API",
        desc: "Created highly secure backend services allowing students to reserve, return and track textbook catalogs.",
        tech: "Spring Boot, Hibernate, MySQL, Docker"
      }
    ],
    certifications: ["Oracle Java Associate"],
    resumeText: `ROHAN VERMA - Backend Software Specialist
rohan.v@collegetech.edu
SKILLS: Java, Spring Boot, MySQL, REST APIs, Git, Docker, Hibernate.
PROJECTS: Enterprise Library Automation: Created standard administrative REST APIs mapping textbook inventories.
EDUCATION: B.Tech in Computer Science - College Tech (CGPA: 7.5 / 10)`,
    academic: {
      degree: "B.Tech",
      major: "Computer Science",
      institution: "State Engineering College",
      graduationYear: "2026",
      cgpa: "7.5"
    },
    verificationStatus: "Unsubmitted",
    resumeScore: 68,
    atsScore: 65,
    readinessScore: 60
  }
];

export const initialJobs: Job[] = [
  {
    id: "job_1",
    recruiterId: "rec_1",
    recruiterName: "Google India",
    title: "Software Engineering Intern - Web Technologies",
    description: "Looking for an energetic, detail-oriented front-end or full-stack software intern. You will work on production features in React, solve high-throughput system bottlenecks, write test cases, and participate in daily agile stand-ups.",
    skills: ["React", "TypeScript", "Tailwind CSS", "JavaScript", "REST APIs"],
    location: "Bangalore (Onsite)",
    salary: "₹80,000 / Month",
    eligibility: "CGPA 8.0+ CSE/IT/ECE Branches",
    deadline: "2026-07-15",
    verificationStatus: "Approved"
  },
  {
    id: "job_2",
    recruiterId: "rec_2",
    recruiterName: "Microsoft Corp",
    title: "Support Cloud Developer - Azure Operations",
    description: "Join the Azure Support Developer team to assist enterprise partners in configuring server-side microservices, setting up serverless cloud configurations, and optimizing PostgreSQL connection pools.",
    skills: ["Java", "Docker", "SQL", "Cloud Architecture", "Linux Shell"],
    location: "Hyderabad (Hybrid)",
    salary: "₹95,000 / Month",
    eligibility: "GPA 7.5+ All Engineering Streams",
    deadline: "2026-06-30",
    verificationStatus: "Approved"
  },
  {
    id: "job_3",
    recruiterId: "rec_1",
    recruiterName: "Google India",
    title: "AI & ML Specialist Intern",
    description: "Looking for students to collaborate with our Core Analytics team to design prediction workflows, clean massive telemetry, and integrate pre-trained LLM models for text/image grounding capabilities.",
    skills: ["Python", "TensorFlow", "Scikit-Learn", "Pandas", "Prompt Engineering"],
    location: "Bangalore (Onsite)",
    salary: "₹1,10,000 / Month",
    eligibility: "CGPA 8.5+ with Python coursework",
    deadline: "2026-08-01",
    verificationStatus: "Pending"
  }
];

export const initialApplications: Application[] = [
  {
    id: "app_1",
    jobId: "job_1",
    studentId: "stud_1",
    studentName: "Aarav Sharma",
    status: "Shortlisted",
    appliedDate: "2026-06-05"
  },
  {
    id: "app_2",
    jobId: "job_2",
    studentId: "stud_2",
    studentName: "Aditi Iyer",
    status: "Applied",
    appliedDate: "2026-06-06"
  }
];

export const initialDrives: PlacementDrive[] = [
  {
    id: "drive_1",
    companyName: "Google India Drive 2026",
    startDate: "2026-06-25",
    eligibleCourses: ["B.Tech CSE", "B.Tech IT", "M.Tech CSE"],
    cgpaCutoff: 8.0,
    registeredCount: 45,
    status: "Upcoming",
    location: "Campus Main Auditorium"
  },
  {
    id: "drive_2",
    companyName: "Microsoft Cloud Drive",
    startDate: "2026-06-15",
    eligibleCourses: ["B.Tech (All Streams)"],
    cgpaCutoff: 7.5,
    registeredCount: 112,
    status: "Active",
    location: "Seminar Hall room 302"
  },
  {
    id: "drive_3",
    companyName: "Infosys System Engineer Mass Placement",
    startDate: "2026-07-20",
    eligibleCourses: ["B.Tech", "MCA", "B.Sc CS"],
    cgpaCutoff: 6.0,
    registeredCount: 350,
    status: "Upcoming",
    location: "Virtual Online Portal"
  }
];

export const initialMockInterviews: MockInterviewResult[] = [
  {
    id: "mock_1",
    studentId: "stud_1",
    studentName: "Aarav Sharma",
    jobTitle: "Software Engineering Intern - Web Technologies",
    roundType: "Technical",
    totalScore: 82,
    grade: "B",
    verdict: "Strong technical fundamentals; candidate communicates algorithms clearly but could add more focus to system optimization details.",
    strengths: ["Highly skilled in React & JS async functions", "Explains components with clear terminology", "Engaged coding practices"],
    weaknesses: ["Could explain event-driven server design deeper", "Struggles momentarily explaining Redux middleware"],
    detailedQnaFeedback: [
      {
        questionId: 1,
        question: "Explain the difference between state and props in React. When would you prefer state over props?",
        candidateAnswer: "Props are passed down from father to child, and props are read-only. State is created inside the component to store some internal visual changes like text in search inputs.",
        score: 85,
        pros: "Correct distinction between internal state and external props; highlighted read-only nature of props.",
        cons: "Used simplified slang like 'father to child' instead of formal standard 'parent component to child component' vocabulary.",
        suggestedExcellentModelAnswer: "Props represent configuration options passed down in unidirectional flow from parent to child, and are strictly immutable within the child's scope. State is internal, mutable component state managed with hooks like useState. State is used when components need to hold dynamic, user-driven data models."
      }
    ],
    actionableTips: ["Practice advanced React concepts like lazy loading and portal portals.", "Refine engineering definitions to sound highly professional."]
  }
];
