import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Link2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClinics, CLINICS_QUERY_KEY } from "@/features/clinics/queries";
import { useAmbientes } from "@/features/ambientes/queries";
import {
  associateAmbienteToClinic,
  disassociateAmbienteFromClinic,
} from "@/features/clinics/api";
import { toast } from "sonner";
import { StatusBadge } from "@/components/StatusBadge";

export default function PlatformClinicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: clinics = [], isLoading } = useClinics();
  const { data: ambientes = [] } = useAmbientes(null, { platformScope: true });
  const [selectedAmbienteId, setSelectedAmbienteId] = useState<string>("");

  const clinic = useMemo(() => clinics.find((c) => c.id === id), [clinics, id]);

  const associateMutation = useMutation({
    mutationFn: (ambienteId: string) => associateAmbienteToClinic(id!, ambienteId),
    onSuccess: () => {
      toast.success("Ambiente asociado a la clínica");
      setSelectedAmbienteId("");
      queryClient.invalidateQueries({ queryKey: ["ambientes", "platform"] });
    },
  });

  const disassociateMutation = useMutation({
    mutationFn: (ambienteId: string) => disassociateAmbienteFromClinic(id!, ambienteId),
    onSuccess: () => {
      toast.success("Ambiente desasociado");
      queryClient.invalidateQueries({ queryKey: ["ambientes", "platform"] });
    },
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando…</p>;
  }

  if (!clinic) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Clínica no encontrada.</p>
        <Button variant="outline" onClick={() => navigate("/platform/clinics")}>
          Volver
        </Button>
      </div>
    );
  }

  const linkedAmbientes = ambientes.filter((a) => a.clinic_id === clinic.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate("/platform/clinics")}
          aria-label="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="page-header mb-0">
          <h2 className="page-title">{clinic.name}</h2>
          <p className="page-description">
            <StatusBadge
              status={clinic.visible !== false ? "Visible en kiosk" : "Oculta en kiosk"}
              type="active"
            />
          </p>
        </div>
      </div>

      <section className="space-y-4 rounded-lg border p-5">
        <div>
          <h3 className="font-semibold">Ambientes asociados</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Vincula ambientes del catálogo global a esta clínica.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 space-y-2">
            <Label>Ambiente</Label>
            <Select value={selectedAmbienteId} onValueChange={setSelectedAmbienteId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar ambiente" />
              </SelectTrigger>
              <SelectContent>
                {ambientes.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        {linkedAmbientes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay ambientes vinculados a esta clínica.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {linkedAmbientes.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-sm">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.location || "Sin ubicación"}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={disassociateMutation.isPending}
                  onClick={() => disassociateMutation.mutate(a.id)}
                >
                  <Unlink className="h-3.5 w-3.5 mr-1" />
                  Desasociar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
