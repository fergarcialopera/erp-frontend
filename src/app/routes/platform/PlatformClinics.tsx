import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClinics } from "@/features/clinics/queries";
import { createClinic, updateClinic, type ClinicListItem } from "@/features/clinics/api";
import { Pencil, Plus } from "lucide-react";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { tableCell } from "@/components/tableTypography";
import { toast } from "sonner";

const createSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(128),
  visible: z.boolean(),
});

const editSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  visible: z.boolean(),
});

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof editSchema>;

const columns: Column<ClinicListItem>[] = [
  {
    key: "name",
    header: "NOMBRE",
    sortable: true,
    render: (c) => <span className={tableCell.primary}>{c.name}</span>,
  },
  {
    key: "visible",
    header: "KIOSK",
    render: (c) => (
      <StatusBadge status={c.visible !== false ? "Visible en login" : "Oculta"} type="active" />
    ),
  },
];

export default function PlatformClinicsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: records = [], isLoading, isError, refetch } = useClinics();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicListItem | null>(null);

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", password: "", visible: true },
  });

  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: "", visible: true },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateForm) => createClinic(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICS_QUERY_KEY });
      toast.success("Clínica creada");
      createForm.reset({ name: "", password: "", visible: true });
      setCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditForm }) => updateClinic(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICS_QUERY_KEY });
      toast.success("Clínica actualizada");
      setEditing(null);
    },
  });

  const tableColumns: Column<ClinicListItem>[] = [
    ...columns,
    {
      key: "actions",
      header: "",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(c);
              editForm.reset({ name: c.name, visible: c.visible !== false });
            }}
            aria-label={`Editar ${c.name}`}
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
        <h2 className="page-title">Clínicas</h2>
        <p className="page-description">Alta, edición y visibilidad en el acceso kiosk.</p>
      </div>

      <DataTable
        data={records}
        columns={tableColumns}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        searchKey="name"
        searchPlaceholder="Buscar clínica..."
        onRowClick={(c) => navigate(`/platform/clinics/${c.id}`)}
        emptyTitle="Sin clínicas"
        emptyDescription="Crea la primera clínica del sistema."
        headerAction={
          <TableHeaderButton
            label="Nueva clínica"
            icon={<Plus />}
            onClick={() => {
              createForm.reset({ name: "", password: "", visible: true });
              setCreateOpen(true);
            }}
          />
        }
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva clínica</DialogTitle>
            <DialogDescription>Define nombre, contraseña de kiosk y visibilidad.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={createForm.handleSubmit((d) => createMutation.mutate(d))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="clinic-name">Nombre</Label>
              <Input id="clinic-name" {...createForm.register("name")} />
              {createForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic-password">Contraseña de clínica</Label>
              <Input id="clinic-password" type="password" {...createForm.register("password")} />
              {createForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Visible en login kiosk</Label>
                <p className="text-xs text-muted-foreground">
                  Si está oculta, no aparecerá al iniciar sesión.
                </p>
              </div>
              <Switch
                checked={createForm.watch("visible")}
                onCheckedChange={(v) => createForm.setValue("visible", v)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creando…" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar clínica</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit((d) => {
              if (editing) updateMutation.mutate({ id: editing.id, data: d });
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-clinic-name">Nombre</Label>
              <Input id="edit-clinic-name" {...editForm.register("name")} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Visible en login kiosk</Label>
              </div>
              <Switch
                checked={editForm.watch("visible")}
                onCheckedChange={(v) => editForm.setValue("visible", v)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
