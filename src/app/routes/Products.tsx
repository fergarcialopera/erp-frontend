import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProducts } from "@/features/products/queries";
import {
  useBrands,
  useCategories,
  useDispensingTypes,
  useSubcategories,
} from "@/features/catalog/queries";
import { patchClinicProductSettingsByClinic } from "@/features/clinics/api";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/app/providers/useAuth";
import { Settings2 } from "lucide-react";
import { tableCell } from "@/components/tableTypography";
import { toast } from "sonner";
import { Product } from "@/types/models";
import { PRODUCTS_NEW_QUERY_PARAM, PRODUCTS_NEW_QUERY_VALUE } from "@/features/products/constants";
import {
  ListFilterField,
  ListFiltersToolbar,
  LIST_FILTER_NONE,
  type ListFilterChip,
} from "@/components/ListFiltersToolbar";

const NONE = LIST_FILTER_NONE;

function resolveClinicVisible(product: Product): boolean {
  return product.is_visible === true;
}

function catalogStatusLabel(product: Product): string {
  return product.is_active ? "Activo" : "Inactivo";
}

function clinicVisibilityLabel(product: Product): string {
  if (!product.is_active) return "Catálogo inactivo";
  return resolveClinicVisible(product) ? "Visible" : "No visible";
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { clinicId, canToggleProductClinicSettings } = useAuth();

  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState(NONE);
  const [subcategoryFilter, setSubcategoryFilter] = useState(NONE);
  const [brandFilter, setBrandFilter] = useState(NONE);
  const [dispensingFilter, setDispensingFilter] = useState(NONE);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const listFilters = useMemo(
    () => ({
      ...(categoryFilter !== NONE ? { category_id: categoryFilter } : {}),
      ...(subcategoryFilter !== NONE ? { subcategory_id: subcategoryFilter } : {}),
      ...(brandFilter !== NONE ? { brand_id: brandFilter } : {}),
      ...(dispensingFilter !== NONE ? { dispensing_type_id: dispensingFilter } : {}),
      ...(deferredSearch.trim() ? { search: deferredSearch.trim() } : {}),
      ...(statusFilter === "inactive" ? { active: false as const } : {}),
    }),
    [
      categoryFilter,
      subcategoryFilter,
      brandFilter,
      dispensingFilter,
      deferredSearch,
      statusFilter,
    ],
  );

  const {
    data: records = [],
    isLoading: productsLoading,
    isFetching: productsFetching,
    isError,
    refetch,
  } = useProducts(clinicId, {
    activeOnly: statusFilter === "active",
    filters: Object.keys(listFilters).length ? listFilters : undefined,
  });

  const filteredRecords = useMemo(() => {
    if (statusFilter === "inactive") return records.filter((p) => !p.is_active);
    return records;
  }, [records, statusFilter]);

  const { data: categories = [] } = useCategories();
  const { data: allSubcategories = [] } = useSubcategories();
  const { data: brands = [] } = useBrands();
  const { data: dispensingTypes = [] } = useDispensingTypes();

  const filterSubcategories = useMemo(
    () =>
      categoryFilter !== NONE
        ? allSubcategories.filter((s) => s.category_id === categoryFilter)
        : allSubcategories,
    [allSubcategories, categoryFilter],
  );

  const clearAdvancedFilters = () => {
    setCategoryFilter(NONE);
    setSubcategoryFilter(NONE);
    setBrandFilter(NONE);
    setDispensingFilter(NONE);
  };

  const advancedActiveCount = [
    categoryFilter !== NONE,
    subcategoryFilter !== NONE,
    brandFilter !== NONE,
    dispensingFilter !== NONE,
  ].filter(Boolean).length;

  const filterChips: ListFilterChip[] = useMemo(() => {
    const chips: ListFilterChip[] = [];
    if (statusFilter !== "all") {
      chips.push({
        id: "status",
        label: statusFilter === "active" ? "Estado: Activos" : "Estado: Inactivos",
        onRemove: () => setStatusFilter("all"),
      });
    }
    if (categoryFilter !== NONE) {
      const name = categories.find((c) => c.id === categoryFilter)?.name ?? "Categoría";
      chips.push({
        id: "category",
        label: `Categoría: ${name}`,
        onRemove: () => {
          setCategoryFilter(NONE);
          setSubcategoryFilter(NONE);
        },
      });
    }
    if (subcategoryFilter !== NONE) {
      const name = allSubcategories.find((s) => s.id === subcategoryFilter)?.name ?? "Subcategoría";
      chips.push({
        id: "subcategory",
        label: `Subcategoría: ${name}`,
        onRemove: () => setSubcategoryFilter(NONE),
      });
    }
    if (brandFilter !== NONE) {
      const name = brands.find((b) => b.id === brandFilter)?.name ?? "Marca";
      chips.push({
        id: "brand",
        label: `Marca: ${name}`,
        onRemove: () => setBrandFilter(NONE),
      });
    }
    if (dispensingFilter !== NONE) {
      const name = dispensingTypes.find((d) => d.id === dispensingFilter)?.name ?? "Dispensación";
      chips.push({
        id: "dispensing",
        label: `Dispensación: ${name}`,
        onRemove: () => setDispensingFilter(NONE),
      });
    }
    return chips;
  }, [
    statusFilter,
    categoryFilter,
    subcategoryFilter,
    brandFilter,
    dispensingFilter,
    categories,
    allSubcategories,
    brands,
    dispensingTypes,
  ]);

  const isLoading = productsLoading || productsFetching;
  const canConfigureClinic = canToggleProductClinicSettings();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [clinicVisible, setClinicVisible] = useState(false);

  const baseColumns: Column<Product>[] = [
    {
      key: "name",
      header: "NOMBRE",
      sortable: true,
      render: (p) => <span className={tableCell.primary}>{p.name}</span>,
    },
    {
      key: "internal_reference",
      header: "REF. INTERNA",
      hideBelowMd: true,
      render: (p) => <span className={tableCell.mono}>{p.internal_reference || "—"}</span>,
    },
    {
      key: "barcode",
      header: "CÓDIGO BARRAS",
      hideBelowMd: true,
      render: (p) => (
        <span className={`${tableCell.mono} text-muted-foreground`}>{p.barcode || "—"}</span>
      ),
    },
    {
      key: "category",
      header: "CATEGORÍA",
      hideBelowMd: true,
      render: (p) => <span className={tableCell.muted}>{p.category?.name || "—"}</span>,
    },
    {
      key: "subcategory",
      header: "SUBCATEGORÍA",
      hideBelowMd: true,
      render: (p) => <span className={tableCell.muted}>{p.subcategory?.name || "—"}</span>,
    },
    {
      key: "brand",
      header: "MARCA",
      hideBelowMd: true,
      render: (p) => <span className={tableCell.muted}>{p.brand?.name || "—"}</span>,
    },
    {
      key: "dispensing_type",
      header: "DISPENSACIÓN",
      hideBelowMd: true,
      render: (p) => <span className={tableCell.muted}>{p.dispensing_type?.name || "—"}</span>,
    },
    {
      key: "is_active",
      header: "CATÁLOGO",
      render: (p) => <StatusBadge status={catalogStatusLabel(p)} type="active" />,
    },
    {
      key: "is_visible",
      header: "EN CLÍNICA",
      render: (p) => <StatusBadge status={clinicVisibilityLabel(p)} type="active" />,
    },
  ];

  const openClinicSettings = (product: Product) => {
    setEditingProduct(product);
    setClinicVisible(resolveClinicVisible(product));
  };

  const closeClinicSettings = () => {
    setEditingProduct(null);
  };

  const columns: Column<Product>[] = [
    ...baseColumns,
    ...(canConfigureClinic
      ? [
          {
            key: "actions",
            header: "",
            sortable: false,
            render: (p) => (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => openClinicSettings(p)}
                  disabled={!p.is_active}
                  aria-label={`Configurar visibilidad de ${p.name}`}
                >
                  <Settings2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ),
          } as Column<Product>,
        ]
      : []),
  ];

  const settingsMutation = useMutation({
    mutationFn: async ({ productId, visible }: { productId: string; visible: boolean }) => {
      if (!clinicId) {
        throw new Error("Missing clinic context");
      }
      return patchClinicProductSettingsByClinic(clinicId, productId, { visible });
    },
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ["products", clinicId] });
      toast.success("Visibilidad actualizada", {
        description: `«${updatedProduct.name}» — ${updatedProduct.is_visible ? "visible" : "oculto"} en esta clínica.`,
      });
      closeClinicSettings();
    },
  });

  const handleSaveClinicSettings = () => {
    if (!editingProduct || !clinicId) return;
    settingsMutation.mutate({
      productId: editingProduct.id,
      visible: clinicVisible,
    });
  };

  useEffect(() => {
    if (searchParams.get(PRODUCTS_NEW_QUERY_PARAM) !== PRODUCTS_NEW_QUERY_VALUE) return;
    const next = new URLSearchParams(searchParams);
    next.delete(PRODUCTS_NEW_QUERY_PARAM);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Productos</h2>
        <p className="page-description">
          El estado de catálogo lo gestiona el super administrador. En esta clínica, la visibilidad
          determina si el producto puede usarse en operaciones (entradas, salidas, inventario).
        </p>
      </div>

      <DataTable
        data={filteredRecords}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchPlaceholder="Buscar por nombre, barcode o referencia…"
        emptyTitle="Sin productos"
        emptyDescription="No hay productos registrados aún."
        filters={
          <ListFiltersToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar por nombre, barcode o referencia…"
            primaryFilters={
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
              >
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            }
            advancedActiveCount={advancedActiveCount}
            chips={filterChips}
            onClearAll={() => {
              setStatusFilter("all");
              clearAdvancedFilters();
            }}
            advancedFilters={
              <>
                <ListFilterField label="Categoría">
                  <Select
                    value={categoryFilter}
                    onValueChange={(v) => {
                      setCategoryFilter(v);
                      setSubcategoryFilter(NONE);
                    }}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Todas las categorías</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ListFilterField>
                <ListFilterField label="Subcategoría">
                  <Select
                    value={subcategoryFilter}
                    onValueChange={setSubcategoryFilter}
                    disabled={categoryFilter === NONE}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue
                        placeholder={categoryFilter === NONE ? "Elige categoría" : "Subcategoría"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Todas las subcategorías</SelectItem>
                      {filterSubcategories.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ListFilterField>
                <ListFilterField label="Marca">
                  <Select value={brandFilter} onValueChange={setBrandFilter}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Marca" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Todas las marcas</SelectItem>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ListFilterField>
                <ListFilterField label="Tipo de dispensación">
                  <Select value={dispensingFilter} onValueChange={setDispensingFilter}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Dispensación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Todos los tipos</SelectItem>
                      {dispensingTypes.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ListFilterField>
              </>
            }
          />
        }
      />

      <Dialog
        open={editingProduct !== null}
        onOpenChange={(open) => !open && closeClinicSettings()}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Visibilidad en clínica</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? `«${editingProduct.name}» — catálogo ${editingProduct.is_active ? "activo" : "inactivo"}.`
                : "Configuración del producto para esta clínica."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
              <p className="font-medium">Catálogo</p>
              <p className="text-muted-foreground text-xs mt-1">
                Activo o inactivo a nivel global. Solo el super administrador puede modificarlo.
              </p>
              <p className="mt-2">
                <StatusBadge
                  status={editingProduct ? catalogStatusLabel(editingProduct) : "—"}
                  type="active"
                />
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="clinic-product-visible">Visible en clínica</Label>
                <p className="text-xs text-muted-foreground">
                  Si está visible, el producto puede utilizarse en operaciones de esta clínica.
                </p>
              </div>
              <Switch
                id="clinic-product-visible"
                checked={clinicVisible}
                onCheckedChange={setClinicVisible}
                disabled={!editingProduct?.is_active}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeClinicSettings}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveClinicSettings}
              disabled={settingsMutation.isPending || !editingProduct?.is_active}
            >
              {settingsMutation.isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
