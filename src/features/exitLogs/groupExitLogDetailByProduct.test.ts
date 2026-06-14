import { describe, expect, it } from "vitest";
import { groupExitLogDetailByProduct } from "./groupExitLogDetailByProduct";
import type { ExitLogDetail } from "./api";

const detail: ExitLogDetail = {
  exit_log: {
    id: "exit-1",
    status: "CONFIRMED",
    created_at: "2026-01-01T10:00:00Z",
    created_by: { name: "Ana" },
  },
  items: [
    {
      product: { id: "p1", name: "Producto 1", sku: "SKU1" },
      requested_quantity_total: 5,
      locations: [
        {
          item_id: "line-1",
          requested_quantity: 3,
          confirmed_quantity: 3,
          ambiente: { id: "a1", name: "Ambiente A" },
          compartment: { id: "c1", code: "C1" },
        },
        {
          item_id: "line-2",
          requested_quantity: 2,
          confirmed_quantity: 2,
          ambiente: { id: "a1", name: "Ambiente A" },
          compartment: { id: "c2", code: "C2" },
        },
      ],
    },
  ],
};

describe("groupExitLogDetailByProduct", () => {
  it("agrupa locations del mismo producto en una fila visual", () => {
    const rows = groupExitLogDetailByProduct(detail);

    expect(rows).toHaveLength(1);
    expect(rows[0].productName).toBe("Producto 1");
    expect(rows[0].totalQuantity).toBe(5);
    expect(rows[0].locationPicks).toHaveLength(2);
    expect(rows[0].locationPicks[0].quantity).toBe(3);
    expect(rows[0].locationPicks[1].quantity).toBe(2);
  });
});
