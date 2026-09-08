import { describe, expect, it } from "vitest";
import { isClinicOperableProduct } from "./entryProductEligibility";
import type { Product } from "@/types/models";

function product(partial: Partial<Product> & Pick<Product, "id" | "sku" | "name">): Product {
  return {
    is_active: true,
    ...partial,
  };
}

describe("isClinicOperableProduct", () => {
  it("solo admite activos y visibles en la clínica", () => {
    expect(
      isClinicOperableProduct(
        product({ id: "1", sku: "A", name: "A", is_active: true, is_visible: true }),
      ),
    ).toBe(true);
    expect(
      isClinicOperableProduct(
        product({ id: "2", sku: "B", name: "B", is_active: true, is_visible: false }),
      ),
    ).toBe(false);
    expect(
      isClinicOperableProduct(product({ id: "3", sku: "C", name: "C", is_active: true })),
    ).toBe(false);
    expect(
      isClinicOperableProduct(
        product({ id: "4", sku: "D", name: "D", is_active: false, is_visible: true }),
      ),
    ).toBe(false);
  });
});
