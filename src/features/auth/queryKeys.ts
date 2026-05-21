/** Clave de caché del personal; debe incluir la clínica activa. */
export const authStaffQueryKey = (clinicId: string | null) => ["auth", "staff", clinicId] as const;

export const AUTH_STAFF_QUERY_ROOT = ["auth", "staff"] as const;
