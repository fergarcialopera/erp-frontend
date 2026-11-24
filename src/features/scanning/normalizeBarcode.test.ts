import { describe, expect, it } from "vitest";
import { barcodesMatch, normalizeBarcode } from "./normalizeBarcode";

describe("normalizeBarcode", () => {
  it("recorta y elimina espacios internos", () => {
    expect(normalizeBarcode("  123 456  ")).toBe("123456");
  });
});

describe("barcodesMatch", () => {
  it("iguala ignorando mayúsculas y espacios", () => {
    expect(barcodesMatch("Ab-12", " ab-12 ")).toBe(true);
  });

  it("rechaza vacíos o distintos", () => {
    expect(barcodesMatch(null, "1")).toBe(false);
    expect(barcodesMatch("1", "2")).toBe(false);
  });
});
