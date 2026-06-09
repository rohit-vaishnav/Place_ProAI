import { apiRequest } from "./client";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  companyName?: string;
  isActive: boolean;
}

export async function resetPlatform(): Promise<void> {
  await apiRequest("/admin/reset", { method: "POST" });
}

export async function fetchPlatformStats() {
  return apiRequest<Record<string, number>>("/admin/stats");
}

export async function fetchAllUsers(): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>("/admin/users");
}

export async function createUserByAdmin(payload: any): Promise<AdminUser> {
  return apiRequest<AdminUser>("/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteUserByAdmin(userId: string): Promise<void> {
  await apiRequest(`/admin/users/${userId}`, { method: "DELETE" });
}


