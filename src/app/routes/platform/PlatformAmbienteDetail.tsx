import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
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
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { useAmbiente } from "@/features/ambientes/queries";
import { updateAmbiente, deleteAmbiente } from "@/features/ambientes/api";
import { createZone, updateZone, deleteZone } from "@/features/zones/api";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { tableCell } from "@/components/tableTypography";
import { toast } from "sonner";
import type { Zona } from "@/types/models";

const ambienteSchema = z.object({
  name: z.string().trim().min(1).max(255),
  location: z.string().trim().max(255).optional(),
  device_id: z.string().trim().max(255).optional(),
  is_active: z.boolean(),
});

const zoneSchema = z.object({
  code: z.string().trim().min(1).max(64),
  is_active: z.boolean(),
});

type AmbienteForm = z.infer<typeof ambienteSchema>;
type ZoneForm = z.infer<typeof zoneSchema>;

export default function PlatformAmbienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: ambiente, isLoading, isError, refetch } = useAmbiente(id ?? null);
  const zones = ambiente?.zones ?? [];

  const [editOpen, setEditOpen] = useState(false);
  const [zoneModal, setZoneModal] = useState<"create" | Zona | null>(null);

  const ambienteForm = useForm<AmbienteForm>({
    resolver: zodResolver(ambienteSchema),
  });

  const zoneForm = useForm<ZoneForm>({
    resolver: zodResolver(zoneSchema),
    defaultValues: { code: "", is_active: true },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["ambientes", id] });
    queryClient.invalidateQueries({ queryKey: ["ambientes", "platform"] });
  };

  const updateAmbienteMutation = useMutation({
    mutationFn: (data: AmbienteForm) =>
      updateAmbiente(id!, {
        name: data.name,
        location: data.location?.trim() || undefined,
        device_id: data.device_id?.trim() || null,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Ambiente actualizado");
      setEditOpen(false);
    },
  });

  const deleteAmbienteMutation = useMutation({
    mutationFn: () => deleteAmbiente(id!),
    onSuccess: () => {
      toast.success("Ambiente desactivado");
      navigate("/platform/ambientes");
    },
  });

  const createZoneMutation = useMutation({
    mutationFn: (data: ZoneForm) =>
      createZone({ ambiente_id: id!, code: data.code, is_active: data.is_active }),
    onSuccess: () => {
      invalidate();
      toast.success("Zona creada");
      setZoneModal(null);
    },
  });

  const updateZoneMutation = useMutation({
    mutationFn: ({ zoneId, data }: { zoneId: string; data: ZoneForm }) =>
      updateZone(zoneId, { code: data.code, is_active: data.is_active }),
    onSuccess: () => {
      invalidate();
      toast.success("Zona actualizada");
      setZoneModal(null);
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: deleteZone,
    onSuccess: () => {
      invalidate();
      toast.success("Zona eliminada");
      setZoneModal(null);
    },
  });

  const zoneColumns: Column<Zona>[] = [
    {
      key: "code",
      header: "CÓDIGO",
      render: (z) => <span className={tableCell.mono}>{z.code}</span>,
    },
    {
      key: "is_active",
      header: "ESTADO",
      render: (z) => (
        <StatusBadge status={z.is_active ? "Activo" : "Inactivo"} type="active" />
      ),
    },
    {
      key: "actions",
      header: "",
      render: (z) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              setZoneModal(z);
              zoneForm.reset({ code: z.code, is_active: z.is_active });
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const openEditAmbiente = () => {
    if (!ambiente) return;
    ambienteForm.reset({
      name: ambiente.name,
      location: ambiente.location ?? "",
      device_id: ambiente.device_id ?? "",
      is_active: ambiente.is_active,
    });
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/platform/ambientes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="page-header mb-0">
            <h2 className="page-title">{ambiente?.name ?? "Ambiente"}</h2>
            <p className="page-description">{ambiente?.location || "Detalle y zonas"}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={openEditAmbiente} disabled={!ambiente}>
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Editar ambiente
        </Button>
      </div>

      <DataTable
        data={zones}
        columns={zoneColumns}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        searchKey="code"
        emptyTitle="Sin zonas"
        headerAction={
          <TableHeaderButton
            label="Nueva zona"
            icon={<Plus />}
            onClick={() => {
              zoneForm.reset({ code: "", is_active: true });
              setZoneModal("create");
            }}
          />
        }
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar ambiente</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={ambienteForm.handleSubmit((d) => updateAmbienteMutation.mutate(d))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input {...ambienteForm.register("name")} />
            </div>
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Input {...ambienteForm.register("location")} />
            </div>
            <div className="space-y-2">
              <Label>ID dispositivo</Label>
              <Input {...ambienteForm.register("device_id")} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label>Activo</Label>
              <Switch
                checked={ambienteForm.watch("is_active")}
                onCheckedChange={(v) => ambienteForm.setValue("is_active", v)}
              />
            </div>
            <DialogFooter className="justify-between sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                className="mr-auto"
                onClick={() => deleteAmbienteMutation.mutate()}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Desactivar
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateAmbienteMutation.isPending}>
                  Guardar
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={zoneModal !== null} onOpenChange={(open) => !open && setZoneModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{zoneModal === "create" ? "Nueva zona" : "Editar zona"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={zoneForm.handleSubmit((d) => {
              if (zoneModal === "create") createZoneMutation.mutate(d);
              else if (zoneModal && zoneModal !== "create")
                updateZoneMutation.mutate({ zoneId: zoneModal.id, data: d });
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Código</Label>
              <Input {...zoneForm.register("code")} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label>Activa</Label>
              <Switch
                checked={zoneForm.watch("is_active")}
                onCheckedChange={(v) => zoneForm.setValue("is_active", v)}
              />
            </div>
            <DialogFooter className="justify-between sm:justify-between">
              {zoneModal !== "create" && zoneModal && (
                <Button
                  type="button"
                  variant="destructive"
                  className="mr-auto"
                  onClick={() => deleteZoneMutation.mutate(zoneModal.id)}
                >
                  Eliminar
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={() => setZoneModal(null)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
