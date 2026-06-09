import { useState, useCallback } from "react";
import { StudentProfile, Job, Application, PlacementDrive, MockInterviewResult } from "../types";
import * as studentsApi from "../api/students";
import * as jobsApi from "../api/jobs";
import * as applicationsApi from "../api/applications";
import * as drivesApi from "../api/drives";
import * as mockApi from "../api/mockInterviews";
import { AuthUser } from "../api/auth";

export function usePlatformData(currentUser: AuthUser | null) {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [mockInterviews, setMockInterviews] = useState<MockInterviewResult[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAll = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const tasks: Promise<void>[] = [];

      if (currentUser.role === "student") {
        tasks.push(
          studentsApi.fetchMyProfile().then((p) => {
            setStudentProfile(p);
            setStudents([p]);
          })
        );
      }

      if (currentUser.role === "placementOfficer" || currentUser.role === "admin") {
        tasks.push(studentsApi.fetchStudents().then(setStudents));
      }

      tasks.push(jobsApi.fetchJobs().then(setJobs));
      tasks.push(applicationsApi.fetchApplications().then(setApplications));

      if (currentUser.role === "placementOfficer" || currentUser.role === "admin") {
        tasks.push(drivesApi.fetchDrives().then(setDrives));
      }

      if (currentUser.role === "student") {
        tasks.push(mockApi.fetchMockInterviews().then(setMockInterviews));
      }

      if (currentUser.role === "recruiter") {
        tasks.push(studentsApi.fetchStudents().then(setStudents));
      }

      await Promise.all(tasks);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  return {
    students,
    jobs,
    applications,
    drives,
    mockInterviews,
    studentProfile,
    isLoading,
    error,
    setStudents,
    setJobs,
    setApplications,
    setDrives,
    setMockInterviews,
    setStudentProfile,
    refreshAll,
  };
}
