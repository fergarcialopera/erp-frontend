import type { User } from "@/types/models";

/** Extrae un nombre legible desde distintas formas de respuesta del API o JWT. */
export function resolveUserName(
  record: Record<string, unknown>,
  fallbackEmail?: string,
): string {
  const direct = record.name ?? record.nombre ?? record.full_name ?? record.display_name;
  if (direct != null && String(direct).trim() !== "") {
    return String(direct).trim();
  }

  const first = record.first_name ?? record.given_name;
  const last = record.last_name ?? record.family_name;
  const combined = [first, last]
    .filter((part) => part != null && String(part).trim() !== "")
    .join(" ")
    .trim();
  if (combined) return combined;

  const email = String(record.email ?? fallbackEmail ?? "").trim();
  if (email.includes("@")) {
    const local = email.split("@")[0]?.replace(/[._-]+/g, " ").trim();
    if (local) {
      return local.charAt(0).toUpperCase() + local.slice(1);
    }
  }

  return email;
}

export function getUserDisplayName(user?: Pick<User, "name" | "email"> | null): string {
  if (!user) return "Usuario";
  const resolved = resolveUserName(user, user.email);
  return resolved || "Usuario";
}

export function getUserFirstName(user?: Pick<User, "name" | "email"> | null): string {
  return getUserDisplayName(user).split(/\s+/)[0] || "Usuario";
}

export function getUserInitial(user?: Pick<User, "name" | "email"> | null): string {
  return getUserDisplayName(user).charAt(0).toUpperCase() || "U";
}
