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
import { createSupplier, deleteSupplier, updateSupplier } from "@/features/catalog/api";
import { useSuppliers } from "@/features/catalog/queries";
import { Pencil, Plus } from "lucide-react";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { tableCell } from "@/components/tableTypography";
import { toast } from "sonner";
import { toastMutationError } from "@/lib/toastMutationError";
import type { Supplier } from "@/types/models";

const schema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  legal_name: z.string().trim().max(255).optional().or(z.literal("")),
  tax_id: z.string().trim().max(64).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .max(255)
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "Email no válido",
    }),
  phone: z.string().trim().max(64).optional().or(z.literal("")),
  is_active: z.boolean(),
});

type Form = z.infer<typeof schema>;

export default function PlatformSuppliersPage() {
  const queryClient = useQueryClient();
  const { data: records = [], isLoading, isError, refetch } = useSuppliers();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      legal_name: "",
      tax_id: "",
      email: "",
      phone: "",
      is_active: true,
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["catalog", "suppliers"] });
  };

  const toPayload = (data: Form) => ({
    name: data.name,
    legal_name: data.legal_name?.trim() || null,
    tax_id: data.tax_id?.trim() || null,
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    is_active: data.is_active,
  });

  const createMutation = useMutation({
    mutationFn: (data: Form) => createSupplier(toPayload(data)),
    onSuccess: () => {
      invalidate();
      toast.success("Proveedor creado");
      form.reset({
        name: "",
        legal_name: "",
        tax_id: "",
        email: "",
        phone: "",
        is_active: true,
      });
      setCreateOpen(false);
    },
    onError: (err) => toastMutationError(err, "No se pudo crear el proveedor"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Form }) =>
      updateSupplier(id, toPayload(data)),
    onSuccess: () => {
      invalidate();
      toast.success("Proveedor actualizado");
      setEditing(null);
    },
    onError: (err) => toastMutationError(err, "No se pudo actualizar el proveedor"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      invalidate();
      toast.success("Proveedor desactivado");
      setEditing(null);
    },
    onError: (err) => toastMutationError(err, "No se pudo desactivar el proveedor"),
  });

  const openCreate = () => {
    form.reset({
      name: "",
      legal_name: "",
      tax_id: "",
      email: "",
      phone: "",
      is_active: true,
    });
    setCreateOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    form.reset({
      name: supplier.name,
      legal_name: supplier.legal_name ?? "",
      tax_id: supplier.tax_id ?? "",
      email: supplier.email ?? "",
      phone: supplier.phone ?? "",
      is_active: supplier.is_active,
    });
  };

  const columns: Column<Supplier>[] = [
    {
      key: "name",
      header: "NOMBRE",
      sortable: true,
      render: (s) => <span className={tableCell.primary}>{s.name}</span>,
    },
    {
      key: "legal_name",
      header: "RAZÓN SOCIAL",
      hideBelowMd: true,
      render: (s) => <span className={tableCell.muted}>{s.legal_name || "—"}</span>,
    },
    {
      key: "tax_id",
      header: "NIF/CIF",
      hideBelowSm: true,
      render: (s) => <span className={tableCell.mono}>{s.tax_id || "—"}</span>,
    },
    {
      key: "email",
      header: "EMAIL",
      hideBelowMd: true,
      render: (s) => <span className={tableCell.muted}>{s.email || "—"}</span>,
    },
    {
      key: "phone",
      header: "TELÉFONO",
      hideBelowSm: true,
      render: (s) => <span className={tableCell.muted}>{s.phone || "—"}</span>,
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
      <div className="page-header">
        <h2 className="page-title">Proveedores</h2>
        <p className="page-description">Catálogo global de proveedores.</p>
      </div>

      <DataTable
        data={records}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        searchKey="name"
        searchPlaceholder="Buscar proveedor..."
        emptyTitle="Sin proveedores"
        emptyDescription="Crea el primer proveedor del catálogo."
        headerAction={
          <TableHeaderButton label="Nuevo proveedor" icon={<Plus />} onClick={openCreate} />
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
            <DialogTitle>{isEdit ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Modifica los datos del proveedor."
                : "Define los datos fiscales y de contacto."}
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
                <Label htmlFor="supplier-name">Nombre</Label>
                <Input id="supplier-name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-legal-name">Razón social</Label>
                <Input id="supplier-legal-name" {...form.register("legal_name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-tax-id">NIF/CIF</Label>
                <Input id="supplier-tax-id" {...form.register("tax_id")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-phone">Teléfono</Label>
                <Input id="supplier-phone" {...form.register("phone")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="supplier-email">Email</Label>
                <Input id="supplier-email" type="email" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="supplier-active">Activo</Label>
                <p className="text-xs text-muted-foreground">
                  Si está desactivado, no estará disponible en el catálogo.
                </p>
              </div>
              <Switch
                id="supplier-active"
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
