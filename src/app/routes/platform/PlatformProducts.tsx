import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProducts } from "@/features/products/queries";
import { createProduct, updateProduct, deleteProduct } from "@/features/products/api";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { tableCell } from "@/components/tableTypography";
import { toast } from "sonner";
import { Product } from "@/types/models";

const newSchema = z.object({
  sku: z.string().trim().min(1).max(255),
  name: z.string().trim().min(1).max(255),
  barcode: z.string().trim().max(255).optional().or(z.literal("")),
});

const editSchema = newSchema.extend({ is_active: z.boolean() });

type NewForm = z.infer<typeof newSchema>;
type EditForm = z.infer<typeof editSchema>;

export default function PlatformProductsPage() {
  const queryClient = useQueryClient();
  const { data: records = [], isLoading, isError, refetch } = useProducts(null, {
    platformScope: true,
    activeOnly: false,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const form = useForm<NewForm>({
    resolver: zodResolver(newSchema),
    defaultValues: { sku: "", name: "", barcode: "" },
  });

  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { sku: "", name: "", barcode: "", is_active: true },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["products", "platform"] });

  const createMutation = useMutation({
    mutationFn: (data: NewForm) =>
      createProduct({
        sku: data.sku,
        name: data.name,
        barcode: data.barcode?.trim() || undefined,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Producto creado");
      form.reset();
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditForm }) =>
      updateProduct(id, {
        sku: data.sku,
        name: data.name,
        barcode: data.barcode?.trim() || undefined,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Producto actualizado");
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      invalidate();
      toast.success("Producto desactivado");
      setEditing(null);
    },
  });

  const columns: Column<Product>[] = [
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      render: (p) => <span className={tableCell.mono}>{p.sku}</span>,
    },
    {
      key: "name",
      header: "NOMBRE",
      sortable: true,
      render: (p) => <span className={tableCell.primary}>{p.name}</span>,
    },
    {
      key: "is_active",
      header: "CATÁLOGO",
      render: (p) => (
        <StatusBadge status={p.is_active ? "Activo" : "Inactivo"} type="active" />
      ),
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
            onClick={() => {
              setEditing(p);
              editForm.reset({
                sku: p.sku,
                name: p.name,
                barcode: p.barcode ?? "",
                is_active: p.is_active,
              });
            }}
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
        <p className="page-description">Catálogo global: activo o inactivo para todo el sistema.</p>
      </div>

      <DataTable
        data={records}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        searchKey="name"
        searchPlaceholder="Buscar producto..."
        emptyTitle="Sin productos"
        headerAction={
          <TableHeaderButton
            label="Nuevo producto"
            icon={<Plus />}
            onClick={() => {
              form.reset();
              setModalOpen(true);
            }}
          />
        }
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo producto</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((d) => createMutation.mutate(d))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input {...form.register("sku")} />
            </div>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <Label>Código de barras</Label>
              <Input {...form.register("barcode")} />
            </div>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit((d) => {
              if (editing) updateMutation.mutate({ id: editing.id, data: d });
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input {...editForm.register("sku")} />
            </div>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input {...editForm.register("name")} />
            </div>
            <div className="space-y-2">
              <Label>Código de barras</Label>
              <Input {...editForm.register("barcode")} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Activo en catálogo</Label>
                <p className="text-xs text-muted-foreground">
                  Si está inactivo, no podrá asignarse ni usarse en ninguna clínica.
                </p>
              </div>
              <Switch
                checked={editForm.watch("is_active")}
                onCheckedChange={(v) => editForm.setValue("is_active", v)}
              />
            </div>
            <DialogFooter className="justify-between sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                className="mr-auto gap-1.5"
                onClick={() => editing && deleteMutation.mutate(editing.id)}
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
