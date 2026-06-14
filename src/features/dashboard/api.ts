import { fetchRecentExitProductRows } from "@/features/exitLogs/api";
import type { DashboardData } from "@/types/models";

const RECENT_EXITS_LIMIT = 5;

export const fetchDashboard = async (): Promise<DashboardData> => {
  const latestExits = await fetchRecentExitProductRows(RECENT_EXITS_LIMIT);
  return { latest_exits: latestExits };
};
