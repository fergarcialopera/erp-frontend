import { describe, expect, it } from "vitest";
import { planLinesToCreateItem } from "./buildExitLogCreatePayload";

describe("planLinesToCreateItem", () => {
  it("usa locations[] cuando hay varios compartimentos", () => {
    const item = planLinesToCreateItem("p1", [
      {
        compartmentId: "c1",
        quantity: 3,
        location: { ambiente: "A", compartment: "C1" },
      },
      {
        compartmentId: "c2",
        quantity: 2,
        location: { ambiente: "A", compartment: "C2" },
      },
    ]);

    expect(item).toEqual({
      product_id: "p1",
      locations: [
        { compartment_id: "c1", quantity: 3 },
        { compartment_id: "c2", quantity: 2 },
      ],
    });
  });

  it("usa formato legacy con un solo compartimento", () => {
    const item = planLinesToCreateItem("p1", [
      {
        compartmentId: "c1",
        quantity: 2,
        location: {},
      },
    ]);

    expect(item).toEqual({
      product_id: "p1",
      quantity: 2,
      compartment_id: "c1",
    });
  });
});
