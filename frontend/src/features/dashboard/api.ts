import { apiClient } from "@/lib/api-client";
import type { DashboardStats } from "./types";

/**
 * Fetches role-specific dashboard metrics, charts, and recent activity from the API.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return apiClient.get<DashboardStats>("/dashboard/stats");
}

export const dashboardApi = {
  getDashboardStats,
};
