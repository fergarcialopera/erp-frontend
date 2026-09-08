import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmbientes } from "@/features/ambientes/queries";
import { createAmbiente } from "@/features/ambientes/api";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormDialogFooter } from "@/components/FormDialogFooter";
import { Plus } from "lucide-react";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { tableCell } from "@/components/tableTypography";
import { toast } from "sonner";
import type { Ambiente } from "@/types/models";

const schema = z.object({
  name: z.string().trim().min(1).max(255),
  location: z.string().trim().max(255).optional(),
  device_id: z.string().trim().max(255).optional(),
});

type Form = z.infer<typeof schema>;

const columns: Column<Ambiente>[] = [
  {
    key: "name",
    header: "NOMBRE",
    sortable: true,
    render: (a) => <span className={tableCell.primary}>{a.name}</span>,
  },
  {
    key: "location",
    header: "UBICACIÓN",
    render: (a) => <span className={tableCell.muted}>{a.location || "—"}</span>,
  },
  {
    key: "device_id",
    header: "DISPOSITIVO",
    render: (a) => <span className={tableCell.mono}>{a.device_id || "—"}</span>,
  },
  {
    key: "is_active",
    header: "ESTADO",
    render: (a) => <StatusBadge status={a.is_active ? "Activo" : "Inactivo"} type="active" />,
  },
];

export default function PlatformAmbientesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: records = [],
    isLoading,
    isError,
    refetch,
  } = useAmbientes(null, {
    platformScope: true,
  });
  const [open, setOpen] = useState(false);

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", location: "", device_id: "" },
  });

  const createMutation = useMutation({
    mutationFn: (data: Form) =>
      createAmbiente({
        name: data.name,
        location: data.location?.trim() || undefined,
        device_id: data.device_id?.trim() || undefined,
        is_active: true,
      }),
    onSuccess: (ambiente) => {
      queryClient.invalidateQueries({ queryKey: ["ambientes", "platform"] });
      toast.success("Ambiente creado");
      setOpen(false);
      form.reset();
      navigate(`/platform/ambientes/${ambiente.id}`);
    },
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Ambientes</h2>
        <p className="page-description">Catálogo global de ambientes y zonas.</p>
      </div>

      <DataTable
        data={records}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        searchKey="name"
        onRowClick={(a) => navigate(`/platform/ambientes/${a.id}`)}
        emptyTitle="Sin ambientes"
        headerAction={
          <TableHeaderButton
            label="Nuevo ambiente"
            icon={<Plus />}
            onClick={() => {
              form.reset();
              setOpen(true);
            }}
          />
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Nuevo ambiente</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Input {...form.register("location")} />
            </div>
            <div className="space-y-2">
              <Label>ID dispositivo</Label>
              <Input {...form.register("device_id")} />
            </div>
            <FormDialogFooter
              submitLabel="Crear"
              isPending={createMutation.isPending}
              onCancel={() => setOpen(false)}
            />
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
