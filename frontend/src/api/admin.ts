import { apiRequest } from "./client";

export async function resetPlatform(): Promise<void> {
  await apiRequest("/admin/reset", { method: "POST" });
}

export async function fetchPlatformStats() {
  return apiRequest<Record<string, number>>("/admin/stats");
}
