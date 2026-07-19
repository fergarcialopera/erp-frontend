import { describe, expect, it, vi } from "vitest";
import { fetchProducts, filterProductsClient, mapProductFromApi } from "./api";
import { apiClient } from "@/lib/apiClient";

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

  it("mapea relaciones de catálogo y unit_of_measure", () => {
    const product = mapProductFromApi({
      id: "p1",
      sku: "SKU-1",
      name: "Vacuna",
      internal_reference: "REF-1",
      category_id: "c1",
      brand_id: "b1",
      unit_of_measure: "Cajas",
      is_active: true,
      category: { id: "c1", name: "Farmacia" },
      brand: { id: "b1", name: "Acme" },
    });

    expect(product.internal_reference).toBe("REF-1");
    expect(product.category?.name).toBe("Farmacia");
    expect(product.brand?.name).toBe("Acme");
    expect(product.unit_of_measure).toBe("Cajas");
  });

  it("filtra productos en cliente por categoría y búsqueda", () => {
    const products = [
      mapProductFromApi({
        id: "1",
        sku: "A",
        name: "Alpha",
        barcode: "111",
        category_id: "cat-1",
        is_active: true,
      }),
      mapProductFromApi({
        id: "2",
        sku: "B",
        name: "Beta",
        internal_reference: "REF-B",
        category_id: "cat-2",
        is_active: false,
      }),
    ];

    expect(filterProductsClient(products, { category_id: "cat-1" })).toHaveLength(1);
    expect(filterProductsClient(products, { search: "ref-b" })[0]?.id).toBe("2");
    expect(filterProductsClient(products, { active: false })).toHaveLength(1);
  });

  it("no aplica filtro cliente por supplier si el listado no trae suppliers", () => {
    const products = [
      mapProductFromApi({
        id: "1",
        sku: "A",
        name: "Alpha",
        is_active: true,
      }),
    ];
    expect(filterProductsClient(products, { supplier_id: "sup-1" })).toHaveLength(1);
  });

  it("sí filtra por supplier cuando hay embeds de suppliers", () => {
    const products = [
      mapProductFromApi({
        id: "1",
        sku: "A",
        name: "Alpha",
        is_active: true,
        suppliers: [
          {
            id: "ps1",
            product_id: "1",
            supplier_id: "sup-1",
            name: "Prov",
            is_preferred: false,
          },
        ],
      }),
      mapProductFromApi({
        id: "2",
        sku: "B",
        name: "Beta",
        is_active: true,
        suppliers: [],
      }),
    ];
    expect(filterProductsClient(products, { supplier_id: "sup-1" })).toHaveLength(1);
  });
});
