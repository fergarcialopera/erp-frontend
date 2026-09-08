import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { tableCell } from "@/components/tableTypography";
import {
  bulkPatchProductClinicVisibility,
  patchProductClinicVisibility,
  type ProductClinic,
} from "@/features/products/api";
import { productClinicsQueryKey, useProductClinics } from "@/features/products/queries";
import { toast } from "sonner";
import { toastMutationError } from "@/lib/toastMutationError";

type Props = {
  productId: string;
};

export function ProductClinicsPanel({ productId }: Props) {
  const queryClient = useQueryClient();
  const { data: clinics = [], isLoading, isError, refetch } = useProductClinics(productId);

  const unavailableCount = useMemo(
    () => clinics.filter((c) => !c.visible).length,
    [clinics],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: productClinicsQueryKey(productId) });
  };

  const toggleMutation = useMutation({
    mutationFn: ({ clinicId, visible }: { clinicId: string; visible: boolean }) =>
      patchProductClinicVisibility(productId, clinicId, visible),
    onSuccess: (result, vars) => {
      const clinic = clinics.find((c) => c.clinic_id === vars.clinicId);
      const name = clinic?.name ?? "Clínica";
      toast.success(
        result.visible
          ? `Disponible en «${name}»`
          : `No disponible en «${name}»`,
      );
      invalidate();
    },
    onError: (err) => toastMutationError(err, "No se pudo actualizar la disponibilidad"),
  });

  const activateAllMutation = useMutation({
    mutationFn: () => bulkPatchProductClinicVisibility(productId, { visible: true }),
    onSuccess: (result) => {
      invalidate();
      if (result.updated === 0) {
        toast.success("Ya estaba disponible en todas las clínicas");
        return;
      }
      toast.success(
        result.updated === 1
          ? "Activado en 1 clínica"
          : `Activado en ${result.updated} clínicas`,
      );
    },
    onError: (err) => toastMutationError(err, "No se pudo activar en todas las clínicas"),
  });

  const busy = toggleMutation.isPending || activateAllMutation.isPending;

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold">Disponibilidad en clínicas</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Al crearse, el producto no está disponible. Actívalo donde corresponda.
          </p>
        </div>
        {unavailableCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            disabled={busy}
            onClick={() => activateAllMutation.mutate()}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {activateAllMutation.isPending ? "Activando…" : "Activar en todas"}
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando clínicas…</p>
      ) : isError ? (
        <div className="space-y-2">
          <p className="text-sm text-destructive">No se pudieron cargar las clínicas.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      ) : clinics.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay clínicas en el sistema.</p>
      ) : (
        <ul className="divide-y rounded-md border max-h-56 overflow-y-auto">
          {clinics.map((clinic) => (
            <ClinicAvailabilityRow
              key={clinic.clinic_id}
              clinic={clinic}
              disabled={busy}
              onToggle={(visible) =>
                toggleMutation.mutate({ clinicId: clinic.clinic_id, visible })
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ClinicAvailabilityRow({
  clinic,
  disabled,
  onToggle,
}: {
  clinic: ProductClinic;
  disabled: boolean;
  onToggle: (visible: boolean) => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2.5">
      <div className="min-w-0">
        <p className={`truncate ${tableCell.primary}`}>{clinic.name}</p>
        {!clinic.visible_in_kiosk ? (
          <p className="text-xs text-muted-foreground">Kiosk oculto</p>
        ) : null}
      </div>
      <Switch
        checked={clinic.visible}
        disabled={disabled}
        onCheckedChange={onToggle}
        aria-label={
          clinic.visible
            ? `${clinic.name}: disponible. Desactivar`
            : `${clinic.name}: no disponible. Activar`
        }
      />
    </li>
  );
}
