import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createCategory, deleteCategory, updateCategory } from "@/features/catalog/api";
import { useCategories, useSubcategories } from "@/features/catalog/queries";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { tableCell } from "@/components/tableTypography";
import { toast } from "sonner";
import { toastMutationError } from "@/lib/toastMutationError";
import { slugifyName } from "@/lib/slugify";
import type { Category } from "@/types/models";

const schema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  slug: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  is_active: z.boolean(),
});

type Form = z.infer<typeof schema>;

export default function PlatformCategoriesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: records = [], isLoading, isError, refetch } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [slugManual, setSlugManual] = useState(false);

  const subcategoryCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of subcategories) {
      map.set(s.category_id, (map.get(s.category_id) ?? 0) + 1);
    }
    return map;
  }, [subcategories]);

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", description: "", is_active: true },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["catalog", "categories"] });
    queryClient.invalidateQueries({ queryKey: ["catalog", "subcategories"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: Form) =>
      createCategory({
        name: data.name,
        slug: data.slug?.trim() || slugifyName(data.name) || null,
        description: data.description?.trim() || null,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Categoría creada");
      form.reset({ name: "", slug: "", description: "", is_active: true });
      setSlugManual(false);
      setCreateOpen(false);
    },
    onError: (err) => toastMutationError(err, "No se pudo crear la categoría"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Form }) =>
      updateCategory(id, {
        name: data.name,
        slug: data.slug?.trim() || null,
        description: data.description?.trim() || null,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Categoría actualizada");
      setEditing(null);
    },
    onError: (err) => toastMutationError(err, "No se pudo actualizar la categoría"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      invalidate();
      toast.success("Categoría desactivada");
      setEditing(null);
    },
    onError: (err) => toastMutationError(err, "No se pudo desactivar la categoría"),
  });

  const openCreate = () => {
    setSlugManual(false);
    form.reset({ name: "", slug: "", description: "", is_active: true });
    setCreateOpen(true);
  };

  const openEdit = (category: Category) => {
    setSlugManual(true);
    setEditing(category);
    form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      is_active: category.is_active,
    });
  };

  const onNameChange = (value: string) => {
    form.setValue("name", value, { shouldValidate: true });
    if (!slugManual) {
      form.setValue("slug", slugifyName(value), { shouldValidate: true });
    }
  };

  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "NOMBRE",
      sortable: true,
      render: (c) => <span className={tableCell.primary}>{c.name}</span>,
    },
    {
      key: "slug",
      header: "SLUG",
      hideBelowSm: true,
      render: (c) => <span className={tableCell.mono}>{c.slug}</span>,
    },
    {
      key: "description",
      header: "DESCRIPCIÓN",
      hideBelowMd: true,
      render: (c) => <span className={tableCell.muted}>{c.description?.trim() || "—"}</span>,
    },
    {
      key: "is_active",
      header: "ESTADO",
      render: (c) => <StatusBadge status={c.is_active ? "Activo" : "Inactivo"} type="active" />,
    },
    {
      key: "subcategories",
      header: "SUBCAT.",
      render: (c) => <span className={tableCell.numeric}>{subcategoryCount.get(c.id) ?? 0}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() =>
              navigate(`/platform/subcategories?category_id=${encodeURIComponent(c.id)}`)
            }
            aria-label={`Subcategorías de ${c.name}`}
            title="Subcategorías"
          >
            <FolderTree className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => openEdit(c)}
            aria-label={`Editar ${c.name}`}
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
      <div className="page-header">
        <h2 className="page-title">Categorías</h2>
        <p className="page-description">Catálogo global de categorías de producto.</p>
      </div>

      <DataTable
        data={records}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        searchKey="name"
        searchPlaceholder="Buscar categoría..."
        emptyTitle="Sin categorías"
        emptyDescription="Crea la primera categoría del catálogo."
        headerAction={
          <TableHeaderButton label="Nueva categoría" icon={<Plus />} onClick={openCreate} />
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Modifica los datos de la categoría."
                : "Define nombre, slug y estado de la categoría."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((data) => {
              if (editing) updateMutation.mutate({ id: editing.id, data });
              else createMutation.mutate(data);
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="category-name">Nombre</Label>
              <Input
                id="category-name"
                value={form.watch("name")}
                onChange={(e) => onNameChange(e.target.value)}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                {...form.register("slug", {
                  onChange: () => setSlugManual(true),
                })}
              />
              {form.formState.errors.slug && (
                <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Descripción</Label>
              <Textarea id="category-description" rows={3} {...form.register("description")} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="category-active">Activa</Label>
                <p className="text-xs text-muted-foreground">
                  Si está desactivada, no estará disponible en el catálogo.
                </p>
              </div>
              <Switch
                id="category-active"
                checked={form.watch("is_active")}
                onCheckedChange={(v) => form.setValue("is_active", v)}
              />
            </div>
            <DialogFooter className="justify-between sm:justify-between">
              {isEdit && editing && (
                <Button
                  type="button"
                  variant="destructive"
                  className="mr-auto"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(editing.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Desactivar
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateOpen(false);
                    setEditing(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Guardando…"
                    : isEdit
                      ? "Guardar"
                      : "Crear"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
