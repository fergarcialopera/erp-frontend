import { describe, expect, it } from "vitest";
import { planExitPick, type ZonaStock } from "./planExitPick";

const zone1: ZonaStock = {
  zoneId: "zone1",
  quantity: 3,
  location: { ambiente: "Ambiente A", zona: "Zona 1" },
};

const zone2: ZonaStock = {
  zoneId: "zone2",
  quantity: 5,
  location: { ambiente: "Ambiente A", zona: "Zona 2" },
};

describe("planExitPick", () => {
  it("situación 1: elige una sola zona que cubre la solicitud completa", () => {
    expect(planExitPick(4, [zone1, zone2])).toEqual([
      { zoneId: "zone2", quantity: 4, location: zone2.location },
    ]);
  });

  it("situación 2: si varias pueden cubrir, prioriza la de menos unidades", () => {
    expect(planExitPick(2, [zone1, zone2])).toEqual([
      { zoneId: "zone1", quantity: 2, location: zone1.location },
    ]);
  });

  it("situación 3: combina zonas empezando por la más cercana al solicitado", () => {
    expect(planExitPick(6, [zone1, zone2])).toEqual([
      { zoneId: "zone2", quantity: 5, location: zone2.location },
      { zoneId: "zone1", quantity: 1, location: zone1.location },
    ]);
  });

  it("devuelve vacío si no hay stock", () => {
    expect(planExitPick(1, [])).toEqual([]);
  });
});
