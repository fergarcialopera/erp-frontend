const ACCESS_EVENT_LABELS: Record<string, string> = {
  pin_login: "Login PIN",
  clinic_login: "Login clínica",
  email_login: "Login email",
  logout: "Cierre de sesión",
  clinic_logout: "Cierre sesión clínica",
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  add: "Alta",
  edit: "Edición",
  delete: "Baja",
};

const ACTIVITY_TYPE_STYLES: Record<string, string> = {
  add: "bg-success/10 text-success",
  edit: "bg-accent/15 text-accent",
  delete: "bg-destructive/10 text-destructive",
};

const SUCCESS_STYLES = {
  ok: "bg-success/10 text-success",
  fail: "bg-destructive/10 text-destructive",
} as const;

export function formatAuditDate(value: string | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function accessEventLabel(event: string): string {
  const key = event.trim().toLowerCase();
  return ACCESS_EVENT_LABELS[key] ?? (event || "—");
}

export function activityTypeLabel(type: string): string {
  const key = type.trim().toLowerCase();
  return ACTIVITY_TYPE_LABELS[key] ?? (type || "—");
}

export function activityTypeStyle(type: string): string {
  return ACTIVITY_TYPE_STYLES[type.trim().toLowerCase()] ?? "bg-muted text-muted-foreground";
}

export function successStyle(success: boolean): string {
  return success ? SUCCESS_STYLES.ok : SUCCESS_STYLES.fail;
}

export function successLabel(success: boolean): string {
  return success ? "Correcto" : "Fallido";
}

export function auditUserLabel(user: { name?: string; email?: string } | null | undefined): string {
  if (!user) return "—";
  const name = user.name?.trim();
  if (name) return name;
  return user.email?.trim() || "—";
}
