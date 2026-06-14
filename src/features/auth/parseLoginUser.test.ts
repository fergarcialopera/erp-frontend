import { describe, expect, it } from "vitest";
import { parseUserFromLoginResponse } from "./parseLoginUser";

describe("parseUserFromLoginResponse", () => {
  it("usa el nombre del usuario en la respuesta de login", () => {
    const user = parseUserFromLoginResponse("token", {
      user: {
        id: "user-1",
        clinic_id: "clinic-1",
        name: "Elena Martin",
        email: "staff@clinic.local",
        role: "STAFF",
        is_active: true,
      },
    });

    expect(user.name).toBe("Elena Martin");
    expect(user.email).toBe("staff@clinic.local");
  });

  it("resuelve el nombre desde GET /me plano", () => {
    const user = parseUserFromLoginResponse("token", {
      id: "user-1",
      clinic_id: "clinic-1",
      name: "Elena Martin",
      email: "staff@clinic.local",
      role: "STAFF",
    });

    expect(user.name).toBe("Elena Martin");
  });

  it("preserva SUPER_ADMIN desde login", () => {
    const user = parseUserFromLoginResponse("token", {
      user: {
        id: "user-sa",
        clinic_id: "",
        name: "Super Admin",
        email: "super@lock.local",
        role: "SUPER_ADMIN",
        is_active: true,
      },
    });

    expect(user.role).toBe("SUPER_ADMIN");
  });
});
