import { describe, expect, it } from "vitest";
import { planExitPick, type CompartmentStock } from "./planExitPick";

const comp1: CompartmentStock = {
  compartmentId: "comp1",
  quantity: 3,
  location: { ambiente: "Ambiente A", compartment: "Compartimento 1" },
};

const comp2: CompartmentStock = {
  compartmentId: "comp2",
  quantity: 5,
  location: { ambiente: "Ambiente A", compartment: "Compartimento 2" },
};

describe("planExitPick", () => {
  it("situación 1: elige un solo compartimento que cubre la solicitud completa", () => {
    expect(planExitPick(4, [comp1, comp2])).toEqual([
      { compartmentId: "comp2", quantity: 4, location: comp2.location },
    ]);
  });

  it("situación 2: si varios pueden cubrir, prioriza el de menos unidades", () => {
    expect(planExitPick(2, [comp1, comp2])).toEqual([
      { compartmentId: "comp1", quantity: 2, location: comp1.location },
    ]);
  });

  it("situación 3: combina compartimentos empezando por el más cercano al solicitado", () => {
    expect(planExitPick(6, [comp1, comp2])).toEqual([
      { compartmentId: "comp2", quantity: 5, location: comp2.location },
      { compartmentId: "comp1", quantity: 1, location: comp1.location },
    ]);
  });

  it("devuelve vacío si no hay stock", () => {
    expect(planExitPick(1, [])).toEqual([]);
  });
});
