import mongoose from "mongoose";
import env from "../config/env.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import PlacementDrive from "../models/PlacementDrive.js";
import MockInterview from "../models/MockInterview.js";
import { USER_ROLES, VERIFICATION_STATUS, JOB_VERIFICATION_STATUS, APPLICATION_STATUS } from "../constants/index.js";
import logger from "../utils/logger.js";

const DEMO_PASSWORD = "password123";

async function seed() {
  await mongoose.connect(env.mongodbUri);
  logger.info("Connected for seeding...");

  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    PlacementDrive.deleteMany({}),
    MockInterview.deleteMany({}),
  ]);

  const [aaravUser, aditiUser, rohanUser, googleRec, msRec, officer, admin] = await User.create([
    { name: "Aarav Sharma", email: "aarav.sharma@collegetech.edu", password: DEMO_PASSWORD, role: USER_ROLES.STUDENT },
    { name: "Aditi Iyer", email: "aditi.iyer@collegetech.edu", password: DEMO_PASSWORD, role: USER_ROLES.STUDENT },
    { name: "Rohan Verma", email: "rohan.v@collegetech.edu", password: DEMO_PASSWORD, role: USER_ROLES.STUDENT },
    { name: "Google Recruiter (India)", email: "recruitment@google.com", password: DEMO_PASSWORD, role: USER_ROLES.RECRUITER, companyName: "Google India" },
    { name: "Microsoft Recruiting", email: "careers@microsoft.com", password: DEMO_PASSWORD, role: USER_ROLES.RECRUITER, companyName: "Microsoft Corp" },
    { name: "Prof. Rajesh Mehra", email: "placement.officer@collegetech.edu", password: DEMO_PASSWORD, role: USER_ROLES.PLACEMENT_OFFICER },
    { name: "System Super Administrator", email: "admin.root@collegetech.edu", password: DEMO_PASSWORD, role: USER_ROLES.ADMIN },
  ]);

  await Student.create([
    {
      userId: aaravUser._id,
      name: "Aarav Sharma",
      email: "aarav.sharma@collegetech.edu",
      phone: "+91 98765 43210",
      linkedin: "https://linkedin.com/in/aaravsharma-link",
      github: "https://github.com/aaravsharma-git",
      skills: ["React", "Node.js", "Express", "MongoDB", "JavaScript", "HTML/CSS", "Python"],
      projects: [
        { name: "Campus Security System", desc: "IoT and web dashboard for gate monitoring.", tech: "React, Node, Socket.io" },
        { name: "E-Commerce Microservice", desc: "Checkout API with Stripe.", tech: "Express, PostgreSQL, Redis" },
      ],
      certifications: ["AWS Certified Developer Associate", "MongoDB Associate Developer"],
      resumeText: "AARAV SHARMA - Full-Stack Developer\nSkills: React, Express, MongoDB, Python",
      academic: { degree: "B.Tech", major: "Computer Science", institution: "State Engineering College", graduationYear: "2026", cgpa: "8.9" },
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      resumeScore: 82, atsScore: 78, readinessScore: 85,
    },
    {
      userId: aditiUser._id,
      name: "Aditi Iyer",
      email: "aditi.iyer@collegetech.edu",
      phone: "+91 87654 32109",
      skills: ["Python", "Machine Learning", "Pandas", "Scikit-Learn", "Java", "SQL"],
      projects: [{ name: "Predictive Crop Visualizer", desc: "ML portal for crop yield.", tech: "Python, Flask" }],
      certifications: ["TensorFlow Developer Certificate"],
      resumeText: "ADITI IYER - ML Engineer Aspirant",
      academic: { degree: "B.Tech", major: "Information Technology", institution: "State Engineering College", graduationYear: "2026", cgpa: "9.2" },
      verificationStatus: VERIFICATION_STATUS.PENDING,
      resumeScore: 75, atsScore: 72, readinessScore: 80,
    },
    {
      userId: rohanUser._id,
      name: "Rohan Verma",
      email: "rohan.v@collegetech.edu",
      phone: "+91 76543 21098",
      skills: ["Java", "Spring Boot", "SQL", "Docker", "REST APIs"],
      projects: [{ name: "Library Micro-API", desc: "Secure backend for textbook catalogs.", tech: "Spring Boot, MySQL" }],
      certifications: ["Oracle Java Associate"],
      resumeText: "ROHAN VERMA - Backend Specialist",
      academic: { degree: "B.Tech", major: "Computer Science", institution: "State Engineering College", graduationYear: "2026", cgpa: "7.5" },
      verificationStatus: VERIFICATION_STATUS.UNSUBMITTED,
      resumeScore: 68, atsScore: 65, readinessScore: 60,
    },
  ]);

  const [job1, job2, job3] = await Job.create([
    {
      recruiterId: googleRec._id,
      recruiterName: "Google India",
      title: "Software Engineering Intern - Web Technologies",
      description: "Front-end or full-stack intern working on React features and agile stand-ups.",
      skills: ["React", "TypeScript", "Tailwind CSS", "JavaScript", "REST APIs"],
      location: "Bangalore (Onsite)",
      salary: "₹80,000 / Month",
      eligibility: "CGPA 8.0+ CSE/IT/ECE Branches",
      deadline: "2026-07-15",
      verificationStatus: JOB_VERIFICATION_STATUS.APPROVED,
    },
    {
      recruiterId: msRec._id,
      recruiterName: "Microsoft Corp",
      title: "Support Cloud Developer - Azure Operations",
      description: "Azure support team for microservices and serverless configurations.",
      skills: ["Java", "Docker", "SQL", "Cloud Architecture", "Linux Shell"],
      location: "Hyderabad (Hybrid)",
      salary: "₹95,000 / Month",
      eligibility: "GPA 7.5+ All Engineering Streams",
      deadline: "2026-06-30",
      verificationStatus: JOB_VERIFICATION_STATUS.APPROVED,
    },
    {
      recruiterId: googleRec._id,
      recruiterName: "Google India",
      title: "AI & ML Specialist Intern",
      description: "Collaborate on prediction workflows and LLM integration.",
      skills: ["Python", "TensorFlow", "Scikit-Learn", "Pandas", "Prompt Engineering"],
      location: "Bangalore (Onsite)",
      salary: "₹1,10,000 / Month",
      eligibility: "CGPA 8.5+ with Python coursework",
      deadline: "2026-08-01",
      verificationStatus: JOB_VERIFICATION_STATUS.PENDING,
    },
  ]);

  await Application.create([
    {
      studentId: aaravUser._id,
      jobId: job1._id,
      recruiterId: googleRec._id,
      studentName: "Aarav Sharma",
      status: APPLICATION_STATUS.SHORTLISTED,
      appliedAt: new Date("2026-06-05"),
    },
    {
      studentId: aditiUser._id,
      jobId: job2._id,
      recruiterId: msRec._id,
      studentName: "Aditi Iyer",
      status: APPLICATION_STATUS.APPLIED,
      appliedAt: new Date("2026-06-06"),
    },
  ]);

  await PlacementDrive.create([
    { companyName: "Google India Drive 2026", startDate: "2026-06-25", eligibleCourses: ["B.Tech CSE", "B.Tech IT", "M.Tech CSE"], cgpaCutoff: 8.0, registeredCount: 45, status: "Upcoming", location: "Campus Main Auditorium", createdBy: officer._id },
    { companyName: "Microsoft Cloud Drive", startDate: "2026-06-15", eligibleCourses: ["B.Tech (All Streams)"], cgpaCutoff: 7.5, registeredCount: 112, status: "Active", location: "Seminar Hall room 302", createdBy: officer._id },
    { companyName: "Infosys System Engineer Mass Placement", startDate: "2026-07-20", eligibleCourses: ["B.Tech", "MCA", "B.Sc CS"], cgpaCutoff: 6.0, registeredCount: 350, status: "Upcoming", location: "Virtual Online Portal", createdBy: officer._id },
  ]);

  await MockInterview.create({
    studentId: aaravUser._id,
    studentName: "Aarav Sharma",
    jobTitle: "Software Engineering Intern - Web Technologies",
    roundType: "Technical",
    totalScore: 82,
    grade: "B",
    verdict: "Strong technical fundamentals with clear communication.",
    strengths: ["React & JS async", "Clear terminology", "Engaged coding practices"],
    weaknesses: ["Event-driven server design", "Redux middleware"],
    detailedQnaFeedback: [{
      questionId: 1,
      question: "Explain state vs props in React.",
      candidateAnswer: "Props are passed from parent, read-only. State is internal.",
      score: 85,
      pros: "Correct distinction.",
      cons: "Informal vocabulary.",
      suggestedExcellentModelAnswer: "Props are immutable configuration from parent; state is mutable internal data via hooks.",
    }],
    actionableTips: ["Practice advanced React concepts.", "Refine professional definitions."],
    communicationScore: 78,
    confidenceScore: 80,
  });

  logger.info("Seed completed. Demo password for all accounts: password123");
  logger.info("Students: aarav.sharma@collegetech.edu, aditi.iyer@collegetech.edu");
  logger.info("Recruiters: recruitment@google.com, careers@microsoft.com");
  logger.info("Officer: placement.officer@collegetech.edu | Admin: admin.root@collegetech.edu");

  await mongoose.disconnect();
}

seed().catch((err) => {
  logger.error("Seed failed", err);
  process.exit(1);
});
