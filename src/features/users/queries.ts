import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "./api";

export interface UseUsersOptions {
  /** Si false, no se hace la petición (evita 403 cuando el backend restringe GET /users a ADMIN). */
  enabled?: boolean;
}

export const useUsers = (clinicId: string | null, options?: UseUsersOptions) => {
  const enabled = options?.enabled !== false;
  return useQuery({
    queryKey: ["users", clinicId],
    queryFn: fetchUsers,
    enabled: !!clinicId && enabled,
  });
};
