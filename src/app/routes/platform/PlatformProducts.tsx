import { useDeferredValue, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProducts } from "@/features/products/queries";
import { createProduct, updateProduct, deleteProduct } from "@/features/products/api";
import {
  useBrands,
  useCategories,
  useDispensingTypes,
  useSubcategories,
  useSuppliers,
} from "@/features/catalog/queries";
import { ProductSuppliersPanel } from "@/features/products/components/ProductSuppliersPanel";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
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
import { Pencil, Plus, Trash2 } from "lucide-react";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { tableCell } from "@/components/tableTypography";
import { toast } from "sonner";
import { toastMutationError } from "@/lib/toastMutationError";
import type { Product } from "@/types/models";
import {
  ListFilterField,
  ListFiltersToolbar,
  LIST_FILTER_NONE,
  type ListFilterChip,
} from "@/components/ListFiltersToolbar";

const NONE = LIST_FILTER_NONE;

const productSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  barcode: z.string().trim().max(255).optional().or(z.literal("")),
  internal_reference: z.string().trim().max(255).optional().or(z.literal("")),
  category_id: z.string().optional().or(z.literal("")),
  subcategory_id: z.string().optional().or(z.literal("")),
  brand_id: z.string().optional().or(z.literal("")),
  dispensing_type_id: z.string().optional().or(z.literal("")),
  unit_of_measure: z.string().trim().min(1).max(64),
  is_active: z.boolean(),
});

type ProductForm = z.infer<typeof productSchema>;

const emptyForm: ProductForm = {
  name: "",
  barcode: "",
  internal_reference: "",
  category_id: "",
  subcategory_id: "",
  brand_id: "",
  dispensing_type_id: "",
  unit_of_measure: "Unidades",
  is_active: true,
};

function toNullableId(value: string | undefined): string | null {
  if (!value || value === NONE) return null;
  return value;
}

function toPayload(data: ProductForm) {
  return {
    name: data.name.trim(),
    barcode: data.barcode?.trim() || null,
    internal_reference: data.internal_reference?.trim() || null,
    category_id: toNullableId(data.category_id),
    subcategory_id: toNullableId(data.subcategory_id),
    brand_id: toNullableId(data.brand_id),
    dispensing_type_id: toNullableId(data.dispensing_type_id),
    unit_of_measure: data.unit_of_measure.trim() || "Unidades",
    is_active: data.is_active,
  };
}

export default function PlatformProductsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>(NONE);
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>(NONE);
  const [brandFilter, setBrandFilter] = useState<string>(NONE);
  const [dispensingFilter, setDispensingFilter] = useState<string>(NONE);
  const [supplierFilter, setSupplierFilter] = useState<string>(NONE);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const listFilters = useMemo(
    () => ({
      ...(categoryFilter !== NONE ? { category_id: categoryFilter } : {}),
      ...(subcategoryFilter !== NONE ? { subcategory_id: subcategoryFilter } : {}),
      ...(brandFilter !== NONE ? { brand_id: brandFilter } : {}),
      ...(dispensingFilter !== NONE ? { dispensing_type_id: dispensingFilter } : {}),
      ...(supplierFilter !== NONE ? { supplier_id: supplierFilter } : {}),
      ...(deferredSearch.trim() ? { search: deferredSearch.trim() } : {}),
      ...(statusFilter === "inactive" ? { active: false as const } : {}),
    }),
    [
      categoryFilter,
      subcategoryFilter,
      brandFilter,
      dispensingFilter,
      supplierFilter,
      deferredSearch,
      statusFilter,
    ],
  );

  const {
    data: records = [],
    isLoading,
    isError,
    refetch,
  } = useProducts(null, {
    platformScope: true,
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
  const { data: suppliers = [] } = useSuppliers();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyForm,
  });

  const editForm = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyForm,
  });

  const watchedCategory = form.watch("category_id");
  const watchedEditCategory = editForm.watch("category_id");

  const createSubcategories = useMemo(
    () =>
      watchedCategory
        ? allSubcategories.filter((s) => s.category_id === watchedCategory && s.is_active)
        : [],
    [allSubcategories, watchedCategory],
  );

  const editSubcategories = useMemo(
    () =>
      watchedEditCategory
        ? allSubcategories.filter((s) => s.category_id === watchedEditCategory)
        : [],
    [allSubcategories, watchedEditCategory],
  );

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
    setSupplierFilter(NONE);
  };

  const advancedActiveCount = [
    categoryFilter !== NONE,
    subcategoryFilter !== NONE,
    brandFilter !== NONE,
    dispensingFilter !== NONE,
    supplierFilter !== NONE,
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
    if (supplierFilter !== NONE) {
      const name = suppliers.find((s) => s.id === supplierFilter)?.name ?? "Proveedor";
      chips.push({
        id: "supplier",
        label: `Proveedor: ${name}`,
        onRemove: () => setSupplierFilter(NONE),
      });
    }
    return chips;
  }, [
    statusFilter,
    categoryFilter,
    subcategoryFilter,
    brandFilter,
    dispensingFilter,
    supplierFilter,
    categories,
    allSubcategories,
    brands,
    dispensingTypes,
    suppliers,
  ]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["products", "platform"] });

  const createMutation = useMutation({
    mutationFn: (data: ProductForm) => createProduct(toPayload(data)),
    onSuccess: () => {
      invalidate();
      toast.success("Producto creado");
      form.reset(emptyForm);
      setModalOpen(false);
    },
    onError: (err) => toastMutationError(err, "No se pudo crear el producto"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductForm }) =>
      updateProduct(id, toPayload(data)),
    onSuccess: () => {
      invalidate();
      toast.success("Producto actualizado");
      setEditing(null);
    },
    onError: (err) => toastMutationError(err, "No se pudo actualizar el producto"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      invalidate();
      toast.success("Producto desactivado");
      setEditing(null);
    },
    onError: (err) => toastMutationError(err, "No se pudo desactivar el producto"),
  });

  const openEdit = (p: Product) => {
    setEditing(p);
    editForm.reset({
      name: p.name,
      barcode: p.barcode ?? "",
      internal_reference: p.internal_reference ?? "",
      category_id: p.category_id ?? "",
      subcategory_id: p.subcategory_id ?? "",
      brand_id: p.brand_id ?? "",
      dispensing_type_id: p.dispensing_type_id ?? "",
      unit_of_measure: p.unit_of_measure || "Unidades",
      is_active: p.is_active,
    });
  };

  const columns: Column<Product>[] = [
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
      header: "ESTADO",
      render: (p) => <StatusBadge status={p.is_active ? "Activo" : "Inactivo"} type="active" />,
    },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => openEdit(p)}
            aria-label={`Editar ${p.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Productos</h2>
        <p className="page-description">
          Catálogo global con relaciones de categoría, marca, dispensación y proveedores.
        </p>
      </div>

      <DataTable
        data={filteredRecords}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        searchPlaceholder="Buscar por nombre, barcode o referencia…"
        emptyTitle="Sin productos"
        headerAction={
          <TableHeaderButton
            label="Nuevo producto"
            icon={<Plus />}
            onClick={() => {
              form.reset(emptyForm);
              setModalOpen(true);
            }}
          />
        }
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
                <ListFilterField label="Proveedor">
                  <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Todos los proveedores</SelectItem>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo producto</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
            <ProductFormFields
              form={form}
              categories={categories}
              subcategories={createSubcategories}
              brands={brands}
              dispensingTypes={dispensingTypes}
              onCategoryChange={() => form.setValue("subcategory_id", "")}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit((d) => {
              if (editing) updateMutation.mutate({ id: editing.id, data: d });
            })}
            className="space-y-4"
          >
            <ProductFormFields
              form={editForm}
              sku={editing?.sku}
              categories={categories}
              subcategories={editSubcategories}
              brands={brands}
              dispensingTypes={dispensingTypes}
              onCategoryChange={() => editForm.setValue("subcategory_id", "")}
            />
            {editing ? <ProductSuppliersPanel productId={editing.id} /> : null}
            <DialogFooter className="justify-between sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                className="mr-auto gap-1.5"
                onClick={() => editing && deleteMutation.mutate(editing.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
                Desactivar
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  Guardar
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductFormFields({
  form,
  categories,
  subcategories,
  brands,
  dispensingTypes,
  onCategoryChange,
  sku,
}: {
  form: ReturnType<typeof useForm<ProductForm>>;
  categories: { id: string; name: string }[];
  subcategories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  dispensingTypes: { id: string; name: string }[];
  onCategoryChange: () => void;
  sku?: string | null;
}) {
  const categoryId = form.watch("category_id");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label>Nombre *</Label>
        <Input {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Código de barras</Label>
        <Input {...form.register("barcode")} />
      </div>
      <div className="space-y-2">
        <Label>Referencia interna</Label>
        <Input {...form.register("internal_reference")} />
      </div>
      <div className="space-y-2">
        <Label>Categoría</Label>
        <Select
          value={categoryId || NONE}
          onValueChange={(v) => {
            form.setValue("category_id", v === NONE ? "" : v);
            onCategoryChange();
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sin categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Sin categoría</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Subcategoría</Label>
        <Select
          value={form.watch("subcategory_id") || NONE}
          onValueChange={(v) => form.setValue("subcategory_id", v === NONE ? "" : v)}
          disabled={!categoryId}
        >
          <SelectTrigger>
            <SelectValue placeholder={categoryId ? "Sin subcategoría" : "Elige categoría"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Sin subcategoría</SelectItem>
            {subcategories.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Marca</Label>
        <Select
          value={form.watch("brand_id") || NONE}
          onValueChange={(v) => form.setValue("brand_id", v === NONE ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sin marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Sin marca</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Tipo de dispensación</Label>
        <Select
          value={form.watch("dispensing_type_id") || NONE}
          onValueChange={(v) => form.setValue("dispensing_type_id", v === NONE ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sin tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Sin tipo</SelectItem>
            {dispensingTypes.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className={sku ? "space-y-2" : "space-y-2 sm:col-span-2"}>
        <Label>Unidad de medida</Label>
        <Input {...form.register("unit_of_measure")} />
      </div>
      {sku ? (
        <div className="space-y-2">
          <Label>SKU</Label>
          <Input value={sku} disabled className="font-mono" />
        </div>
      ) : null}
      <div className="flex items-center justify-between rounded-lg border p-4 sm:col-span-2">
        <div className="space-y-0.5">
          <Label>Activo en catálogo</Label>
          <p className="text-xs text-muted-foreground">
            Si está inactivo, no podrá usarse en ninguna clínica.
          </p>
        </div>
        <Switch
          checked={form.watch("is_active")}
          onCheckedChange={(v) => form.setValue("is_active", v)}
        />
      </div>
    </div>
  );
}
