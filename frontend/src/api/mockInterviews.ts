import { apiRequest, apiList } from "./client";
import { MockInterviewResult } from "../types";

export async function fetchMockInterviews(): Promise<MockInterviewResult[]> {
  return apiList<MockInterviewResult>("/mock-interviews");
}

export async function saveMockInterview(result: Omit<MockInterviewResult, "id">): Promise<MockInterviewResult> {
  return apiRequest<MockInterviewResult>("/mock-interviews", {
    method: "POST",
    body: JSON.stringify(result),
  });
}
