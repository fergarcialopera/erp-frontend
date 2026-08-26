import { describe, expect, it } from "vitest";
import { productImportIssueLabel, sessionStatusLabel } from "./labels";

describe("productImportIssueLabel", () => {
  it("traduce wrong_delimiter sin parsear message", () => {
    const label = productImportIssueLabel("wrong_delimiter");
    expect(label).toMatch(/punto y coma/);
    expect(label).toMatch(/Odoo/);
  });

  it("incluye columna cuando existe", () => {
    expect(productImportIssueLabel("missing_name", "Nombre")).toContain("columna: Nombre");
  });

  it("devuelve el code si no hay traducción", () => {
    expect(productImportIssueLabel("unknown_code_xyz")).toBe("unknown_code_xyz");
  });
});

describe("sessionStatusLabel", () => {
  it("etiqueta ready_for_review", () => {
    expect(sessionStatusLabel("ready_for_review")).toBe("Lista para revisar");
  });
});
