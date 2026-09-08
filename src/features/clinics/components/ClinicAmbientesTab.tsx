import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link2, Unlink } from "lucide-react";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { tableCell } from "@/components/tableTypography";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAmbientes } from "@/features/ambientes/queries";
import {
  associateAmbienteToClinic,
  disassociateAmbienteFromClinic,
  patchClinicAmbienteSettingsByClinic,
  type ClinicAmbienteItem,
} from "@/features/clinics/api";
import { clinicAmbientesQueryKey, useClinicAmbientes } from "@/features/clinics/queries";
import { toast } from "sonner";

type Props = {
  clinicId: string;
};

export function ClinicAmbientesTab({ clinicId }: Props) {
  const queryClient = useQueryClient();
  const {
    data: linked = [],
    isLoading,
    isError,
    refetch,
  } = useClinicAmbientes(clinicId);
  const { data: catalog = [] } = useAmbientes(null, { platformScope: true });
  const [selectedAmbienteId, setSelectedAmbienteId] = useState("");

  const linkedIds = useMemo(() => new Set(linked.map((a) => a.id)), [linked]);
  const available = useMemo(
    () => catalog.filter((a) => !linkedIds.has(a.id)),
    [catalog, linkedIds],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: clinicAmbientesQueryKey(clinicId) });
    queryClient.invalidateQueries({ queryKey: ["ambientes", "platform"] });
  };

  const associateMutation = useMutation({
    mutationFn: (ambienteId: string) => associateAmbienteToClinic(clinicId, ambienteId),
    onSuccess: () => {
      toast.success("Ambiente asociado");
      setSelectedAmbienteId("");
      invalidate();
    },
  });

  const disassociateMutation = useMutation({
    mutationFn: (ambienteId: string) => disassociateAmbienteFromClinic(clinicId, ambienteId),
    onSuccess: () => {
      toast.success("Ambiente desasociado");
      invalidate();
    },
  });

  const visibilityMutation = useMutation({
    mutationFn: ({ ambienteId, visible }: { ambienteId: string; visible: boolean }) =>
      patchClinicAmbienteSettingsByClinic(clinicId, ambienteId, { visible }),
    onSuccess: (_data, vars) => {
      toast.success(vars.visible ? "Ambiente visible en la clínica" : "Ambiente oculto en la clínica");
      invalidate();
    },
  });

  const columns: Column<ClinicAmbienteItem>[] = [
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
      key: "is_active",
      header: "ESTADO",
      render: (a) => (
        <StatusBadge status={a.is_active ? "Activo" : "Inactivo"} type="active" />
      ),
    },
    {
      key: "visible",
      header: "EN CLÍNICA",
      render: (a) => (
        <div className="flex items-center gap-3">
          <StatusBadge status={a.visible ? "Visible" : "Oculto"} type="active" />
          <Switch
            checked={a.visible}
            disabled={visibilityMutation.isPending}
            onCheckedChange={(checked) =>
              visibilityMutation.mutate({ ambienteId: a.id, visible: checked })
            }
            aria-label={
              a.visible
                ? `Ocultar ambiente ${a.name} en la clínica`
                : `Mostrar ambiente ${a.name} en la clínica`
            }
          />
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (a) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={disassociateMutation.isPending}
            onClick={() => disassociateMutation.mutate(a.id)}
          >
            <Unlink className="h-3.5 w-3.5 mr-1" />
            Desasociar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 rounded-lg border p-4">
        <div className="flex-1 space-y-2">
          <Label>Asociar ambiente del catálogo</Label>
          <Select value={selectedAmbienteId} onValueChange={setSelectedAmbienteId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar ambiente" />
            </SelectTrigger>
            <SelectContent>
              {available.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {available.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No hay ambientes pendientes de asociar.
            </p>
          )}
        </div>
        <Button
          className="sm:self-end"
          disabled={!selectedAmbienteId || associateMutation.isPending}
          onClick={() => associateMutation.mutate(selectedAmbienteId)}
        >
          <Link2 className="h-4 w-4 mr-2" />
          Asociar
        </Button>
      </div>

      <DataTable
        data={linked}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        searchKey="name"
        searchPlaceholder="Buscar ambiente..."
        emptyTitle="Sin ambientes"
        emptyDescription="Asocia ambientes del catálogo global a esta clínica."
      />
    </div>
  );
}
