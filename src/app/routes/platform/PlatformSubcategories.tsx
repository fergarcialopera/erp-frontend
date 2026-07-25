import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormDialogFooter } from "@/components/FormDialogFooter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSubcategory, deleteSubcategory, updateSubcategory } from "@/features/catalog/api";
import { useCategories, useSubcategories } from "@/features/catalog/queries";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { tableCell } from "@/components/tableTypography";
import {
  ListFiltersToolbar,
  LIST_FILTER_NONE,
  type ListFilterChip,
} from "@/components/ListFiltersToolbar";
import { toast } from "sonner";
import { toastMutationError } from "@/lib/toastMutationError";
import type { Subcategory } from "@/types/models";

const schema = z.object({
  category_id: z.string().min(1, "La categoría es obligatoria"),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  is_active: z.boolean(),
});

type Form = z.infer<typeof schema>;

const ALL_CATEGORIES = LIST_FILTER_NONE;

export default function PlatformSubcategoriesPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryIdFromQuery = searchParams.get("category_id") ?? "";

  const [filterCategoryId, setFilterCategoryId] = useState(categoryIdFromQuery);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Subcategory | null>(null);

  useEffect(() => {
    setFilterCategoryId(categoryIdFromQuery);
  }, [categoryIdFromQuery]);

  const listFilters = filterCategoryId ? { category_id: filterCategoryId } : undefined;
  const { data: records = [], isLoading, isError, refetch } = useSubcategories(listFilters);
  const { data: categories = [] } = useCategories();

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  const filteredCategoryName = filterCategoryId
    ? categoryNameById.get(filterCategoryId)
    : undefined;

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      category_id: categoryIdFromQuery || "",
      name: "",
      description: "",
      is_active: true,
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["catalog", "subcategories"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: Form) =>
      createSubcategory({
        category_id: data.category_id,
        name: data.name,
        description: data.description?.trim() || null,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Subcategoría creada");
      form.reset({
        category_id: filterCategoryId || "",
        name: "",
        description: "",
        is_active: true,
      });
      setCreateOpen(false);
    },
    onError: (err) => toastMutationError(err, "No se pudo crear la subcategoría"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Form }) =>
      updateSubcategory(id, {
        category_id: data.category_id,
        name: data.name,
        description: data.description?.trim() || null,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Subcategoría actualizada");
      setEditing(null);
    },
    onError: (err) => toastMutationError(err, "No se pudo actualizar la subcategoría"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSubcategory(id),
    onSuccess: () => {
      invalidate();
      toast.success("Subcategoría desactivada");
      setEditing(null);
    },
    onError: (err) => toastMutationError(err, "No se pudo desactivar la subcategoría"),
  });

  const openCreate = () => {
    form.reset({
      category_id: filterCategoryId || "",
      name: "",
      description: "",
      is_active: true,
    });
    setCreateOpen(true);
  };

  const openEdit = (item: Subcategory) => {
    setEditing(item);
    form.reset({
      category_id: item.category_id,
      name: item.name,
      description: item.description ?? "",
      is_active: item.is_active,
    });
  };

  const onFilterChange = (value: string) => {
    const next = value === ALL_CATEGORIES ? "" : value;
    setFilterCategoryId(next);
    if (next) setSearchParams({ category_id: next });
    else setSearchParams({});
  };

  const filterChips: ListFilterChip[] = useMemo(() => {
    if (!filterCategoryId) return [];
    const name = categoryNameById.get(filterCategoryId) ?? "Categoría";
    return [
      {
        id: "category",
        label: `Categoría: ${name}`,
        onRemove: () => onFilterChange(ALL_CATEGORIES),
      },
    ];
  }, [filterCategoryId, categoryNameById]);

  const columns: Column<Subcategory>[] = [
    {
      key: "name",
      header: "NOMBRE",
      sortable: true,
      render: (s) => <span className={tableCell.primary}>{s.name}</span>,
    },
    {
      key: "category_id",
      header: "CATEGORÍA",
      render: (s) => (
        <span className={tableCell.muted}>{categoryNameById.get(s.category_id) ?? "—"}</span>
      ),
    },
    {
      key: "description",
      header: "DESCRIPCIÓN",
      hideBelowMd: true,
      render: (s) => <span className={tableCell.muted}>{s.description?.trim() || "—"}</span>,
    },
    {
      key: "is_active",
      header: "ESTADO",
      render: (s) => <StatusBadge status={s.is_active ? "Activo" : "Inactivo"} type="active" />,
    },
    {
      key: "actions",
      header: "",
      render: (s) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => openEdit(s)}
            aria-label={`Editar ${s.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const isEdit = !!editing;
  const dialogOpen = createOpen || isEdit;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="page-header mb-0">
          <h2 className="page-title">Subcategorías</h2>
          <p className="page-description">
            {filteredCategoryName
              ? `Filtrado por categoría: ${filteredCategoryName}`
              : "Catálogo global de subcategorías de producto."}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5" asChild>
          <Link to="/platform/categories">
            <ArrowLeft className="h-4 w-4" />
            Categorías
          </Link>
        </Button>
      </div>

      <DataTable
        data={records}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        searchKey="name"
        searchPlaceholder="Buscar subcategoría..."
        emptyTitle="Sin subcategorías"
        emptyDescription="Crea la primera subcategoría del catálogo."
        filters={
          <ListFiltersToolbar
            primaryFilters={
              <Select value={filterCategoryId || ALL_CATEGORIES} onValueChange={onFilterChange}>
                <SelectTrigger className="h-9 w-[220px]">
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORIES}>Todas las categorías</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
            chips={filterChips}
            onClearAll={filterCategoryId ? () => onFilterChange(ALL_CATEGORIES) : undefined}
          />
        }
        headerAction={
          <TableHeaderButton label="Nueva subcategoría" icon={<Plus />} onClick={openCreate} />
        }
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar subcategoría" : "Nueva subcategoría"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Puedes cambiar la categoría asociada." : "La categoría es obligatoria."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((data) => {
              if (editing) updateMutation.mutate({ id: editing.id, data });
              else createMutation.mutate(data);
            })}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={form.watch("category_id") || undefined}
                  onValueChange={(v) => form.setValue("category_id", v, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category_id && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.category_id.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategory-name">Nombre</Label>
                <Input id="subcategory-name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory-description">Descripción</Label>
              <Textarea id="subcategory-description" rows={3} {...form.register("description")} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="subcategory-active">Activa</Label>
                <p className="text-xs text-muted-foreground">
                  Si está desactivada, no estará disponible en el catálogo.
                </p>
              </div>
              <Switch
                id="subcategory-active"
                checked={form.watch("is_active")}
                onCheckedChange={(v) => form.setValue("is_active", v)}
              />
            </div>
            <FormDialogFooter
              submitLabel={
                createMutation.isPending || updateMutation.isPending
                  ? "Guardando…"
                  : isEdit
                    ? "Guardar"
                    : "Crear"
              }
              isPending={createMutation.isPending || updateMutation.isPending}
              onCancel={() => {
                setCreateOpen(false);
                setEditing(null);
              }}
              destructiveAction={
                isEdit && editing
                  ? {
                      label: "Desactivar",
                      onClick: () => deleteMutation.mutate(editing.id),
                      isPending: deleteMutation.isPending,
                    }
                  : undefined
              }
            />
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
