import { describe, expect, it } from "vitest";
import { normalizeExitLogDetail } from "./exitLogDetailNormalize";

describe("normalizeExitLogDetail", () => {
  it("agrupa respuesta plana legacy en un ítem por producto", () => {
    const normalized = normalizeExitLogDetail({
      exit_log: { id: "exit-1", status: "DRAFT" },
      items: [
        {
          id: "line-1",
          product: { id: "p1", name: "Prod", sku: "S1" },
          requested_quantity: 2,
          compartment: { id: "c1", code: "C1" },
        },
        {
          id: "line-2",
          product: { id: "p1", name: "Prod", sku: "S1" },
          requested_quantity: 1,
          compartment: { id: "c2", code: "C2" },
        },
      ] as never,
    });

    expect(normalized.items).toHaveLength(1);
    expect(normalized.items[0].requested_quantity_total).toBe(3);
    expect(normalized.items[0].locations).toHaveLength(2);
    expect(normalized.items[0].locations[0].item_id).toBe("line-1");
  });
});
