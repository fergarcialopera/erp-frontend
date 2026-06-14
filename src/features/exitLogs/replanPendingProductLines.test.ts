import { describe, expect, it } from "vitest";
import type { PendingExitItem } from "@/features/dashboard/types";
import { replanPendingProductLines } from "./replanPendingProductLines";
import type { ZonaStock } from "./planExitPick";

const baseItem: PendingExitItem = {
  productId: "p1",
  sku: "SKU1",
  name: "Producto 1",
  availableStock: 8,
  quantity: 4,
  confirmedQuantity: 4,
  exitLogId: "exit-1",
  exitLogItemId: "line-1",
};

const zones: ZonaStock[] = [
  {
    zoneId: "z1",
    quantity: 3,
    location: { ambiente: "A", zona: "Z1" },
  },
  {
    zoneId: "z2",
    quantity: 5,
    location: { ambiente: "A", zona: "Z2" },
  },
];

describe("replanPendingProductLines", () => {
  it("recalcula zonas al cambiar la cantidad", () => {
    const result = replanPendingProductLines("p1", 6, [baseItem], zones);
    const p1Lines = result.filter((row) => row.productId === "p1");

    expect(p1Lines).toHaveLength(2);
    expect(p1Lines.find((row) => row.zoneId === "z2")?.quantity).toBe(5);
    expect(p1Lines.find((row) => row.zoneId === "z1")?.quantity).toBe(1);
  });
});
