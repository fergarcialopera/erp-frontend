import { useState } from "react";
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
import {
  attachSupplierToBrand,
  createBrand,
  deleteBrand,
  detachSupplierFromBrand,
  updateBrand,
} from "@/features/catalog/api";
import {
  catalogKeys,
  useBrandSuppliers,
  useBrands,
  useSuppliers,
} from "@/features/catalog/queries";
import { Pencil, Plus } from "lucide-react";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { tableCell } from "@/components/tableTypography";
import { toast } from "sonner";
import { toastMutationError } from "@/lib/toastMutationError";
import type { Brand } from "@/types/models";

const schema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  is_active: z.boolean(),
});

type Form = z.infer<typeof schema>;

function BrandSuppliersManager({ brandId }: { brandId: string }) {
  const queryClient = useQueryClient();
  const { data: links = [], isLoading } = useBrandSuppliers(brandId);
  const { data: suppliers = [] } = useSuppliers();
  const [supplierId, setSupplierId] = useState("");

  const linkedIds = new Set(links.map((l) => l.supplier_id));
  const available = suppliers.filter((s) => s.is_active && !linkedIds.has(s.id));

  const attachMutation = useMutation({
    mutationFn: (id: string) => attachSupplierToBrand(brandId, { supplier_id: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.brandSuppliers(brandId) });
      toast.success("Proveedor asociado");
      setSupplierId("");
    },
    onError: (err) => toastMutationError(err, "No se pudo asociar el proveedor"),
  });

  const detachMutation = useMutation({
    mutationFn: (id: string) => detachSupplierFromBrand(brandId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.brandSuppliers(brandId) });
      toast.success("Proveedor desasociado");
    },
    onError: (err) => toastMutationError(err, "No se pudo desasociar el proveedor"),
  });

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div>
        <h3 className="text-sm font-semibold">Proveedores de la marca</h3>
        <p className="text-xs text-muted-foreground">
          Asocia proveedores disponibles a esta marca.
        </p>
      </div>

      <div className="flex gap-2">
        <Select value={supplierId || undefined} onValueChange={setSupplierId}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Seleccionar proveedor" />
          </SelectTrigger>
          <SelectContent>
            {available.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!supplierId || attachMutation.isPending}
          onClick={() => attachMutation.mutate(supplierId)}
        >
          Añadir
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando proveedores…</p>
      ) : links.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin proveedores asociados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-2 font-medium">Proveedor</th>
                <th className="py-2 pr-2 font-medium">Estado</th>
                <th className="py-2 font-medium text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b last:border-0">
                  <td className={`py-2 pr-2 ${tableCell.primary}`}>{link.supplier_name}</td>
                  <td className="py-2 pr-2">
                    <StatusBadge status={link.is_active ? "Activo" : "Inactivo"} type="active" />
                  </td>
                  <td className="py-2 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                      disabled={detachMutation.isPending}
                      onClick={() => detachMutation.mutate(link.supplier_id)}
                      aria-label={`Desasociar ${link.supplier_name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PlatformBrandsPage() {
  const queryClient = useQueryClient();
  const { data: records = [], isLoading, isError, refetch } = useBrands();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", is_active: true },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["catalog", "brands"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: Form) =>
      createBrand({
        name: data.name,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Marca creada");
      form.reset({ name: "", is_active: true });
      setCreateOpen(false);
    },
    onError: (err) => toastMutationError(err, "No se pudo crear la marca"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Form }) =>
      updateBrand(id, {
        name: data.name,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Marca actualizada");
      setEditing(null);
    },
    onError: (err) => toastMutationError(err, "No se pudo actualizar la marca"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: () => {
      invalidate();
      toast.success("Marca desactivada");
      setEditing(null);
    },
    onError: (err) => toastMutationError(err, "No se pudo desactivar la marca"),
  });

  const openCreate = () => {
    form.reset({ name: "", is_active: true });
    setCreateOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditing(brand);
    form.reset({
      name: brand.name,
      is_active: brand.is_active,
    });
  };

  const columns: Column<Brand>[] = [
    {
      key: "name",
      header: "NOMBRE",
      sortable: true,
      render: (b) => <span className={tableCell.primary}>{b.name}</span>,
    },
    {
      key: "is_active",
      header: "ESTADO",
      render: (b) => <StatusBadge status={b.is_active ? "Activo" : "Inactivo"} type="active" />,
    },
    {
      key: "actions",
      header: "",
      render: (b) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => openEdit(b)}
            aria-label={`Editar ${b.name}`}
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
        <h2 className="page-title">Marcas</h2>
        <p className="page-description">Catálogo global de marcas y sus proveedores.</p>
      </div>

      <DataTable
        data={records}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        searchKey="name"
        searchPlaceholder="Buscar marca..."
        emptyTitle="Sin marcas"
        emptyDescription="Crea la primera marca del catálogo."
        headerAction={
          <TableHeaderButton label="Nueva marca" icon={<Plus />} onClick={openCreate} />
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
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar marca" : "Nueva marca"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Modifica la marca y gestiona sus proveedores."
                : "Define nombre y estado de la marca."}
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
              <Label htmlFor="brand-name">Nombre</Label>
              <Input id="brand-name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="brand-active">Activa</Label>
                <p className="text-xs text-muted-foreground">
                  Si está desactivada, no estará disponible en el catálogo.
                </p>
              </div>
              <Switch
                id="brand-active"
                checked={form.watch("is_active")}
                onCheckedChange={(v) => form.setValue("is_active", v)}
              />
            </div>

            {editing && <BrandSuppliersManager brandId={editing.id} />}

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
