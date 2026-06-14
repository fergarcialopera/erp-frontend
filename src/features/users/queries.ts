import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "./api";

export interface UseUsersOptions {
  /** Si false, no se hace la petición. */
  enabled?: boolean;
  /** Permite cargar usuarios sin clinicId (p. ej. SUPER_ADMIN). */
  allowWithoutClinic?: boolean;
}

export const useUsers = (clinicId: string | null, options?: UseUsersOptions) => {
  const enabled = options?.enabled !== false;
  const canFetch = !!clinicId || options?.allowWithoutClinic === true;
  return useQuery({
    queryKey: ["users", clinicId],
    queryFn: fetchUsers,
    enabled: canFetch && enabled,
  });
};
