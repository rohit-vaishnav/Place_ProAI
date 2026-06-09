import { apiRequest, apiList } from "./client";
import { Application } from "../types";

export async function fetchApplications(): Promise<Application[]> {
  return apiList<Application>("/applications");
}

export async function applyToJob(jobId: string): Promise<Application> {
  return apiRequest<Application>(`/applications/jobs/${jobId}/apply`, { method: "POST" });
}

export async function updateApplicationStatus(
  appId: string,
  status: Application["status"],
  extras?: { interviewScore?: number; interviewDate?: string; recruiterFeedback?: string }
): Promise<Application> {
  return apiRequest<Application>(`/applications/${appId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, ...extras }),
  });
}
