import { useQuery } from "@tanstack/react-query";
import { fetchExitLogs } from "./api";

export const useExitLogs = (clinicId: string | null) => {
  return useQuery({
    queryKey: ["exit-logs", clinicId],
    queryFn: fetchExitLogs,
    enabled: !!clinicId,
  });
};

