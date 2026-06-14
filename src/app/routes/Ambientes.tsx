import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/app/providers/useAuth";
import { useAmbientes } from "@/features/ambientes/queries";
import { patchClinicAmbienteSettings } from "@/features/clinics/api";
import { Button } from "@/components/ui/button";
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
import { Settings2 } from "lucide-react";
import { tableCell } from "@/components/tableTypography";
import { toast } from "sonner";
import type { Ambiente } from "@/types/models";

function resolveClinicVisible(ambiente: Ambiente): boolean {
  if (ambiente.is_visible !== undefined) return ambiente.is_visible;
  return ambiente.is_active;
}

const columnsBase = (canConfigureClinic: boolean): Column<Ambiente>[] => [
  {
    key: "name",
    header: "NOMBRE",
    sortable: true,
    render: (a) => <span className={tableCell.primary}>{a.name}</span>,
  },
  {
    key: "location",
    header: "UBICACIÓN",
    hideBelowSm: true,
    render: (a) => <span className={tableCell.muted}>{a.location || "—"}</span>,
  },
  {
    key: "device_id",
    header: "DISPOSITIVO",
    hideBelowSm: true,
    render: (a) => (
      <span className={`${tableCell.mono} text-muted-foreground`}>{a.device_id || "—"}</span>
    ),
  },
  {
    key: "is_active",
    header: "CATÁLOGO",
    render: (a) => (
      <StatusBadge
        status={a.is_active ? "Activo en catálogo" : "Inactivo en catálogo"}
        type="active"
      />
    ),
  },
  ...(canConfigureClinic
    ? ([
        {
          key: "is_visible",
          header: "CLÍNICA",
          render: (a) => (
            <StatusBadge
              status={resolveClinicVisible(a) ? "Visible en clínica" : "Oculto en clínica"}
              type="active"
            />
          ),
        },
      ] as Column<Ambiente>[])
    : []),
];

export default function AmbientesPage() {
  const queryClient = useQueryClient();
  const { clinicId, canToggleAmbienteClinicSettings } = useAuth();
  const {
    data: records,
    isLoading: ambientesLoading,
    isFetching: ambientesFetching,
    isError,
    refetch,
  } = useAmbientes(clinicId);
  const isLoading = ambientesLoading || ambientesFetching;
  const navigate = useNavigate();
  const canConfigureClinic = canToggleAmbienteClinicSettings();
  const [editingAmbiente, setEditingAmbiente] = useState<Ambiente | null>(null);
  const [clinicVisible, setClinicVisible] = useState(true);

  const openClinicSettings = (ambiente: Ambiente) => {
    setEditingAmbiente(ambiente);
    setClinicVisible(resolveClinicVisible(ambiente));
  };

  const closeClinicSettings = () => {
    setEditingAmbiente(null);
  };

  const columns: Column<Ambiente>[] = [
    ...columnsBase(canConfigureClinic),
    ...(canConfigureClinic
      ? [
          {
            key: "actions",
            header: "",
            sortable: false,
            render: (a) => (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(event) => {
                    event.stopPropagation();
                    openClinicSettings(a);
                  }}
                  aria-label={`Configurar ${a.name} en clínica`}
                >
                  <Settings2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ),
          } as Column<Ambiente>,
        ]
      : []),
  ];

  const settingsMutation = useMutation({
    mutationFn: async ({ ambienteId, visible }: { ambienteId: string; visible: boolean }) => {
      await patchClinicAmbienteSettings(ambienteId, { visible });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambientes", clinicId] });
      toast.success("Configuración actualizada", {
        description: "La visibilidad del ambiente en la clínica se ha guardado.",
      });
      closeClinicSettings();
    },
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Ambientes</h2>
        <p className="page-description">
          Ambientes disponibles para la clínica. Los administradores pueden mostrar u ocultar
          ambientes en su centro.
        </p>
      </div>

      <DataTable
        data={records || []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Buscar ambiente..."
        onRowClick={(ambiente) => navigate(`/ambientes/${ambiente.id}`)}
        emptyTitle="Sin ambientes"
        emptyDescription="No hay ambientes registrados."
      />

      <Dialog
        open={editingAmbiente !== null}
        onOpenChange={(open) => !open && closeClinicSettings()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Visibilidad en clínica</DialogTitle>
            <DialogDescription>
              {editingAmbiente
                ? `Controla si «${editingAmbiente.name}» aparece en esta clínica.`
                : "Control de visibilidad del ambiente."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="clinic-ambiente-visible">Visible en clínica</Label>
              <p className="text-xs text-muted-foreground">
                Si está oculto, no estará disponible en operaciones de esta clínica.
              </p>
            </div>
            <Switch
              id="clinic-ambiente-visible"
              checked={clinicVisible}
              onCheckedChange={setClinicVisible}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeClinicSettings}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!editingAmbiente) return;
                settingsMutation.mutate({
                  ambienteId: editingAmbiente.id,
                  visible: clinicVisible,
                });
              }}
              disabled={settingsMutation.isPending}
            >
              {settingsMutation.isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
