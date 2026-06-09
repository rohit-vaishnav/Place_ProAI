import Application from "../../models/Application.js";
import Student from "../../models/Student.js";
import Job from "../../models/Job.js";

export async function getPlacementAnalytics() {
  const applications = await Application.find();
  const students = await Student.find();
  const jobs = await Job.find({ isActive: true });

  const byStatus = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const byDepartment = students.reduce((acc, s) => {
    const major = s.academic?.major || "Unknown";
    acc[major] = (acc[major] || 0) + 1;
    return acc;
  }, {});

  const byRecruiter = jobs.reduce((acc, j) => {
    acc[j.recruiterName] = (acc[j.recruiterName] || 0) + 1;
    return acc;
  }, {});

  const verifiedCount = students.filter((s) => s.verificationStatus === "Verified").length;

  return {
    applicationPipeline: byStatus,
    studentsByDepartment: byDepartment,
    jobsByRecruiter: byRecruiter,
    verifiedStudents: verifiedCount,
    totalStudents: students.length,
    totalJobs: jobs.length,
    totalApplications: applications.length,
  };
}
