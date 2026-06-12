import { describe, expect, it } from "vitest";
import { getUserDisplayName, getUserFirstName, getUserInitial } from "./userDisplay";

describe("userDisplay", () => {
  it("prioriza el nombre del usuario", () => {
    expect(getUserDisplayName({ name: "Elena Martin", email: "staff@clinic.local" })).toBe(
      "Elena Martin",
    );
    expect(getUserFirstName({ name: "Elena Martin", email: "staff@clinic.local" })).toBe("Elena");
    expect(getUserInitial({ name: "Elena Martin", email: "staff@clinic.local" })).toBe("E");
  });

  it("usa el email cuando no hay nombre", () => {
    expect(getUserDisplayName({ name: "", email: "staff@clinic.local" })).toBe("Staff");
    expect(getUserFirstName({ name: "", email: "staff@clinic.local" })).toBe("Staff");
  });
});
