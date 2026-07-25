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
  createOperationalRole,
  deleteOperationalRole,
  updateOperationalRole,
} from "@/features/catalog/api";
import { useOperationalRoles } from "@/features/catalog/queries";
import { Pencil, Plus } from "lucide-react";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { tableCell } from "@/components/tableTypography";
import { toast } from "sonner";
import { toastMutationError } from "@/lib/toastMutationError";
import type { OperationalRole } from "@/types/models";

const schema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  is_active: z.boolean(),
});

type Form = z.infer<typeof schema>;

export default function PlatformRolesPage() {
  const queryClient = useQueryClient();
  const { data: records = [], isLoading, isError, refetch } = useOperationalRoles();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<OperationalRole | null>(null);

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", is_active: true },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["catalog", "roles"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: Form) =>
      createOperationalRole({
        name: data.name,
        description: data.description?.trim() || null,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Rol operativo creado");
      form.reset({ name: "", description: "", is_active: true });
      setCreateOpen(false);
    },
    onError: (err) => toastMutationError(err, "No se pudo crear el rol operativo"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Form }) =>
      updateOperationalRole(id, {
        name: data.name,
        description: data.description?.trim() || null,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Rol operativo actualizado");
      setEditing(null);
    },
    onError: (err) => toastMutationError(err, "No se pudo actualizar el rol operativo"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOperationalRole(id),
    onSuccess: () => {
      invalidate();
      toast.success("Rol operativo desactivado");
      setEditing(null);
    },
    onError: (err) => toastMutationError(err, "No se pudo desactivar el rol operativo"),
  });

  const openCreate = () => {
    form.reset({ name: "", description: "", is_active: true });
    setCreateOpen(true);
  };

  const openEdit = (role: OperationalRole) => {
    setEditing(role);
    form.reset({
      name: role.name,
      description: role.description ?? "",
      is_active: role.is_active,
    });
  };

  const columns: Column<OperationalRole>[] = [
    {
      key: "name",
      header: "NOMBRE",
      sortable: true,
      render: (r) => <span className={tableCell.primary}>{r.name}</span>,
    },
    {
      key: "description",
      header: "DESCRIPCIÓN",
      hideBelowMd: true,
      render: (r) => <span className={tableCell.muted}>{r.description?.trim() || "—"}</span>,
    },
    {
      key: "is_active",
      header: "ESTADO",
      render: (r) => <StatusBadge status={r.is_active ? "Activo" : "Inactivo"} type="active" />,
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => openEdit(r)}
            aria-label={`Editar ${r.name}`}
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
        <h2 className="page-title">Roles operativos</h2>
        <p className="page-description">
          Roles de locker para tipos de dispensación; independientes del rol de autenticación.
        </p>
      </div>

      <DataTable
        data={records}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        searchKey="name"
        searchPlaceholder="Buscar rol..."
        emptyTitle="Sin roles operativos"
        emptyDescription="Crea el primer rol operativo de locker."
        headerAction={<TableHeaderButton label="Nuevo rol" icon={<Plus />} onClick={openCreate} />}
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
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar rol operativo" : "Nuevo rol operativo"}</DialogTitle>
            <DialogDescription>
              Estos roles no son los de autenticación (ADMIN, TECHNICIAN, etc.).
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
              <Label htmlFor="role-name">Nombre</Label>
              <Input id="role-name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Descripción</Label>
              <Textarea id="role-description" rows={3} {...form.register("description")} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="role-active">Activo</Label>
                <p className="text-xs text-muted-foreground">
                  Si está desactivado, no estará disponible para dispensación.
                </p>
              </div>
              <Switch
                id="role-active"
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
