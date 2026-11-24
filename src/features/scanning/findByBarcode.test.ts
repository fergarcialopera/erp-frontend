import { describe, expect, it } from "vitest";
import { findExactBarcodeMatch } from "./findByBarcode";

describe("findExactBarcodeMatch", () => {
  const items = [
    { id: "1", barcode: "8412345678901" },
    { id: "2", barcode: null },
    { id: "3", barcode: "ABC-99" },
  ];

  it("encuentra coincidencia exacta normalizada", () => {
    expect(findExactBarcodeMatch(items, " 8412345678901 ")?.id).toBe("1");
    expect(findExactBarcodeMatch(items, "abc-99")?.id).toBe("3");
  });

  it("no hace match parcial ni vacío", () => {
    expect(findExactBarcodeMatch(items, "841")).toBeUndefined();
    expect(findExactBarcodeMatch(items, "   ")).toBeUndefined();
  });
});
