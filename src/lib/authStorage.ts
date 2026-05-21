/** Claves de almacenamiento para sesión de clínica y de usuario. */
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  /** Migración desde versión anterior. */
  LEGACY_ACCESS_TOKEN: "auth_token",
  CLINIC_ACCESS_TOKEN: "clinic_access_token",
  CLINIC_ID: "clinic_id",
  CLINIC_NAME: "clinic_name",
  AUTH_USER: "auth_user",
} as const;

function read(key: string): string | null {
  return localStorage.getItem(key);
}

function write(key: string, value: string): void {
  localStorage.setItem(key, value);
}

function remove(key: string): void {
  localStorage.removeItem(key);
}

/** Token de usuario; migra `auth_token` → `access_token` en lectura. */
export function getAccessToken(): string | null {
  const current = read(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (current) return current;
  const legacy = read(AUTH_STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
  if (legacy) {
    write(AUTH_STORAGE_KEYS.ACCESS_TOKEN, legacy);
    remove(AUTH_STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
    return legacy;
  }
  return null;
}

export function setAccessToken(token: string): void {
  write(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
  remove(AUTH_STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
}

export function clearAccessToken(): void {
  remove(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  remove(AUTH_STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
}

export function getClinicAccessToken(): string | null {
  return read(AUTH_STORAGE_KEYS.CLINIC_ACCESS_TOKEN);
}

export function setClinicAccessToken(token: string): void {
  write(AUTH_STORAGE_KEYS.CLINIC_ACCESS_TOKEN, token);
}

export function clearClinicAccessToken(): void {
  remove(AUTH_STORAGE_KEYS.CLINIC_ACCESS_TOKEN);
}

export function getClinicId(): string | null {
  return read(AUTH_STORAGE_KEYS.CLINIC_ID);
}

export function setClinicId(id: string): void {
  write(AUTH_STORAGE_KEYS.CLINIC_ID, id);
}

export function getClinicName(): string | null {
  return read(AUTH_STORAGE_KEYS.CLINIC_NAME);
}

export function setClinicName(name: string): void {
  write(AUTH_STORAGE_KEYS.CLINIC_NAME, name);
}

export function clearClinicMeta(): void {
  remove(AUTH_STORAGE_KEYS.CLINIC_ID);
  remove(AUTH_STORAGE_KEYS.CLINIC_NAME);
}

export function getAuthUserJson(): string | null {
  return read(AUTH_STORAGE_KEYS.AUTH_USER);
}

export function setAuthUserJson(json: string): void {
  write(AUTH_STORAGE_KEYS.AUTH_USER, json);
}

export function clearAuthUser(): void {
  remove(AUTH_STORAGE_KEYS.AUTH_USER);
}

export function clearUserSession(): void {
  clearAccessToken();
  clearAuthUser();
}

export function clearClinicSession(): void {
  clearClinicAccessToken();
  clearClinicMeta();
}

export function clearAllSessions(): void {
  clearUserSession();
  clearClinicSession();
}
