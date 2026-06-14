import { describe, expect, it } from "vitest";
import {
  canAccessAudit,
  canAccessClinicApp,
  canAccessConfig,
  canAccessManagement,
  canAccessOperations,
  canManageUsers,
  canToggleProductClinicSettings,
  hasClinicPermission,
  hasPermission,
  isSuperAdmin,
} from "@/types/auth";

describe("auth permissions", () => {
  it("reconoce SUPER_ADMIN sin degradarlo", () => {
    expect(isSuperAdmin("SUPER_ADMIN")).toBe(true);
    expect(hasPermission("SUPER_ADMIN", "ADMIN")).toBe(false);
    expect(canAccessClinicApp("SUPER_ADMIN")).toBe(false);
  });

  it("mantiene jerarquía clínica STAFF < TECHNICIAN < ADMIN", () => {
    expect(hasClinicPermission("STAFF", "STAFF")).toBe(true);
    expect(hasClinicPermission("STAFF", "TECHNICIAN")).toBe(false);
    expect(canAccessManagement("TECHNICIAN")).toBe(true);
    expect(canAccessOperations("STAFF")).toBe(true);
    expect(canAccessConfig("ADMIN")).toBe(true);
    expect(canAccessConfig("TECHNICIAN")).toBe(false);
  });

  it("restringe capacidades de plataforma y clínica", () => {
    expect(canManageUsers("SUPER_ADMIN")).toBe(true);
    expect(canManageUsers("ADMIN")).toBe(false);
    expect(canAccessAudit("ADMIN")).toBe(true);
    expect(canAccessAudit("TECHNICIAN")).toBe(false);
    expect(canToggleProductClinicSettings("ADMIN")).toBe(true);
    expect(canToggleProductClinicSettings("TECHNICIAN")).toBe(false);
  });
});
