import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateClinic } from "@/features/clinics/api";
import {
  CLINICS_QUERY_KEY,
  clinicQueryKey,
  useClinic,
} from "@/features/clinics/queries";
import { ClinicUsersTab } from "@/features/clinics/components/ClinicUsersTab";
import { ClinicAmbientesTab } from "@/features/clinics/components/ClinicAmbientesTab";
import { ClinicProductsTab } from "@/features/clinics/components/ClinicProductsTab";
import { toast } from "sonner";

export default function PlatformClinicEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: clinic, isLoading, isError, refetch } = useClinic(id);

  const [name, setName] = useState("");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!clinic) return;
    setName(clinic.name);
    setVisible(clinic.visible !== false);
  }, [clinic]);

  const updateMutation = useMutation({
    mutationFn: (payload: { name?: string; visible?: boolean }) =>
      updateClinic(id!, payload),
    onSuccess: (updated) => {
      toast.success("Clínica actualizada");
      queryClient.setQueryData(clinicQueryKey(id!), updated);
      queryClient.invalidateQueries({ queryKey: CLINICS_QUERY_KEY });
    },
  });

  const nameDirty = clinic ? name.trim() !== clinic.name : false;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando clínica…</p>;
  }

  if (isError || !clinic || !id) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">No se pudo cargar la clínica.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/platform/clinics")}>
            Volver
          </Button>
          {isError && (
            <Button variant="secondary" onClick={() => refetch()}>
              Reintentar
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mt-1"
          onClick={() => navigate("/platform/clinics")}
          aria-label="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="page-header mb-0 flex-1 min-w-0">
          <h2 className="page-title truncate">{clinic.name}</h2>
          <p className="page-description">Edición de clínica, usuarios, ambientes y productos.</p>
        </div>
      </div>

      <section className="space-y-4 rounded-lg border p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="clinic-edit-name">Nombre</Label>
            <Input
              id="clinic-edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={255}
            />
          </div>
          {nameDirty && (
            <Button
              disabled={!name.trim() || updateMutation.isPending}
              onClick={() => updateMutation.mutate({ name: name.trim() })}
            >
              Guardar nombre
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5 pr-4">
            <Label htmlFor="clinic-kiosk-visible">Visible en login kiosk</Label>
            <p className="text-xs text-muted-foreground">
              Si está oculta, no aparecerá en el selector de clínicas del kiosk.
            </p>
          </div>
          <Switch
            id="clinic-kiosk-visible"
            checked={visible}
            disabled={updateMutation.isPending}
            onCheckedChange={(checked) => {
              const previous = visible;
              setVisible(checked);
              updateMutation.mutate(
                { visible: checked },
                { onError: () => setVisible(previous) },
              );
            }}
          />
        </div>
      </section>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="ambientes">Ambientes</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <ClinicUsersTab clinicId={id} />
        </TabsContent>
        <TabsContent value="ambientes">
          <ClinicAmbientesTab clinicId={id} />
        </TabsContent>
        <TabsContent value="products">
          <ClinicProductsTab clinicId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
