import { apiRequest, apiList } from "./client";
import { StudentProfile } from "../types";

export async function fetchMyProfile(): Promise<StudentProfile> {
  return apiRequest<StudentProfile>("/students/me");
}

export async function fetchStudents(): Promise<StudentProfile[]> {
  return apiList<StudentProfile>("/students");
}

export async function updateMyProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
  return apiRequest<StudentProfile>("/students/me", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function requestVerification(): Promise<StudentProfile> {
  return apiRequest<StudentProfile>("/students/me/request-verification", { method: "POST" });
}

export async function verifyStudent(
  id: string,
  status: "Verified" | "Rejected",
  remarks?: string
): Promise<StudentProfile> {
  return apiRequest<StudentProfile>(`/students/${id}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ status, remarks }),
  });
}

export async function deleteStudent(id: string): Promise<void> {
  await apiRequest(`/students/${id}`, { method: "DELETE" });
}

export async function grantVerification(id: string): Promise<void> {
  await apiRequest(`/admin/students/${id}/grant-verification`, { method: "POST" });
}
