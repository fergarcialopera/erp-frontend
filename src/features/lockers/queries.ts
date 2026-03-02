import { useQuery } from "@tanstack/react-query";
import { fetchLockers } from "./api";

export const useLockers = (clinicId: string | null) => {
  return useQuery({
    queryKey: ["lockers", clinicId],
    queryFn: fetchLockers,
    enabled: !!clinicId,
  });
};
