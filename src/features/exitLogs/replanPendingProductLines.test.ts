import { describe, expect, it } from "vitest";
import type { PendingExitItem } from "@/features/dashboard/types";
import { replanPendingProductLines } from "./replanPendingProductLines";
import type { CompartmentStock } from "./planExitPick";

const baseItem: PendingExitItem = {
  productId: "p1",
  sku: "SKU1",
  name: "Producto 1",
  availableStock: 8,
  locations: [],
  quantity: 4,
  confirmedQuantity: 4,
  exitLogId: "exit-1",
  exitLogItemId: "line-1",
};

const compartments: CompartmentStock[] = [
  {
    compartmentId: "c1",
    quantity: 3,
    location: { locker: "L", compartment: "C1" },
  },
  {
    compartmentId: "c2",
    quantity: 5,
    location: { locker: "L", compartment: "C2" },
  },
];

describe("replanPendingProductLines", () => {
  it("recalcula compartimentos al cambiar la cantidad", () => {
    const result = replanPendingProductLines("p1", 6, [baseItem], compartments);
    const p1Lines = result.filter((row) => row.productId === "p1");

    expect(p1Lines).toHaveLength(2);
    expect(p1Lines.find((row) => row.compartmentId === "c2")?.quantity).toBe(5);
    expect(p1Lines.find((row) => row.compartmentId === "c1")?.quantity).toBe(1);
  });
});
