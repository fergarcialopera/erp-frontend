import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "./api";

export const useDashboard = (clinicId: string | null) => {
  return useQuery({
    queryKey: ["dashboard", clinicId],
    queryFn: () => fetchDashboard(),
    enabled: !!clinicId,
  });
};
