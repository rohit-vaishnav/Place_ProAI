import { apiRequest, apiList } from "./client";
import { Job } from "../types";

export async function fetchJobs(): Promise<Job[]> {
  return apiList<Job>("/jobs");
}

export async function createJob(job: Omit<Job, "id">): Promise<Job> {
  return apiRequest<Job>("/jobs", {
    method: "POST",
    body: JSON.stringify({
      title: job.title,
      description: job.description,
      skills: job.skills,
      location: job.location,
      salary: job.salary,
      eligibility: job.eligibility,
      deadline: job.deadline,
    }),
  });
}

export async function updateJob(id: string, job: Partial<Job>): Promise<Job> {
  return apiRequest<Job>(`/jobs/${id}`, {
    method: "PUT",
    body: JSON.stringify(job),
  });
}

export async function deleteJob(id: string): Promise<void> {
  await apiRequest(`/jobs/${id}`, { method: "DELETE" });
}

export async function verifyJob(
  id: string,
  status: "Approved" | "Rejected",
  remarks?: string
): Promise<Job> {
  return apiRequest<Job>(`/jobs/${id}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ status, remarks }),
  });
}
