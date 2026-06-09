import { apiRequest, apiList } from "./client";
import { PlacementDrive } from "../types";

export async function fetchDrives(): Promise<PlacementDrive[]> {
  return apiList<PlacementDrive>("/drives");
}

export async function createDrive(drive: Omit<PlacementDrive, "id">): Promise<PlacementDrive> {
  return apiRequest<PlacementDrive>("/drives", {
    method: "POST",
    body: JSON.stringify(drive),
  });
}

export async function deleteDrive(id: string): Promise<void> {
  await apiRequest(`/drives/${id}`, { method: "DELETE" });
}
