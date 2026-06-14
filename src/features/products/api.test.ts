import { describe, expect, it } from "vitest";
import { fetchProducts } from "./api";
import { apiClient } from "@/lib/apiClient";
import { vi } from "vitest";

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("products api mapping", () => {
  it("normaliza visible del API a is_visible", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "p1",
            clinic_id: "c1",
            sku: "SKU-1",
            name: "Producto",
            is_active: true,
            visible: true,
          },
        ],
      },
    });

    const products = await fetchProducts();
    expect(products[0].is_visible).toBe(true);
  });

  it("conserva visibilidades distintas por producto en la lista", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "p1",
            sku: "SKU-1",
            name: "Visible",
            is_active: true,
            visible: true,
          },
          {
            id: "p2",
            sku: "SKU-2",
            name: "Oculto",
            is_active: true,
            visible: false,
          },
        ],
      },
    });

    const products = await fetchProducts();
    expect(products[0].is_visible).toBe(true);
    expect(products[1].is_visible).toBe(false);
  });

  it("mapea visible false correctamente", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "p2",
            clinic_id: "c1",
            sku: "SKU-2",
            name: "Otro",
            is_active: true,
            visible: false,
          },
        ],
      },
    });

    const products = await fetchProducts();
    expect(products[0].is_visible).toBe(false);
  });
});
