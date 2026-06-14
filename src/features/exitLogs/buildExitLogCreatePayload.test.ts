import { describe, expect, it } from "vitest";
import { planLinesToCreateItem } from "./buildExitLogCreatePayload";

describe("planLinesToCreateItem", () => {
  it("usa locations[] cuando hay varias zonas", () => {
    const item = planLinesToCreateItem("p1", [
      {
        zoneId: "z1",
        quantity: 3,
        location: { ambiente: "A", zona: "Z1" },
      },
      {
        zoneId: "z2",
        quantity: 2,
        location: { ambiente: "A", zona: "Z2" },
      },
    ]);

    expect(item).toEqual({
      product_id: "p1",
      locations: [
        { zone_id: "z1", quantity: 3 },
        { zone_id: "z2", quantity: 2 },
      ],
    });
  });

  it("usa formato legacy con una sola zona", () => {
    const item = planLinesToCreateItem("p1", [
      {
        zoneId: "z1",
        quantity: 2,
        location: {},
      },
    ]);

    expect(item).toEqual({
      product_id: "p1",
      quantity: 2,
      zone_id: "z1",
    });
  });
});
