import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "./api";

export const useUsers = (clinicId: string | null) => {
  return useQuery({
    queryKey: ["users", clinicId],
    queryFn: fetchUsers,
    enabled: !!clinicId,
  });
};
