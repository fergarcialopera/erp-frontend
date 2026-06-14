import { describe, expect, it } from "vitest";
import { SuperAdminLoginError, isSuperAdminLoginError } from "./errors";

describe("SuperAdminLoginError", () => {
  it("identifica el error de rol incorrecto", () => {
    const error = new SuperAdminLoginError();
    expect(isSuperAdminLoginError(error)).toBe(true);
    expect(error.message).toContain("super administrador");
  });

  it("no confunde otros errores", () => {
    expect(isSuperAdminLoginError(new Error("fail"))).toBe(false);
  });
});
