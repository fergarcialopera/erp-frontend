import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIncidents } from "@/features/incidents/queries";
import { updateIncident } from "@/features/incidents/api";
import { tableCell } from "@/components/tableTypography";
import { toast } from "sonner";
import type { Incident, IncidentSeverity } from "@/types/models";

const editSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  status: z.string().trim().min(1).max(64),
});

type EditForm = z.infer<typeof editSchema>;

function normalizeSeverity(value: unknown): EditForm["severity"] {
  const s = String(value ?? "MEDIUM").toUpperCase();
  if (s === "LOW" || s === "MEDIUM" || s === "HIGH" || s === "CRITICAL") return s;
  return "MEDIUM";
}

function severityLabel(severity: IncidentSeverity | string | undefined): string {
  const value = String(severity ?? "").toUpperCase();
  if (value === "LOW") return "Baja";
  if (value === "MEDIUM") return "Media";
  if (value === "HIGH") return "Alta";
  if (value === "CRITICAL") return "Crítica";
  return value || "—";
}

export default function PlatformIncidentsPage() {
  const queryClient = useQueryClient();
  const { data: incidents = [], isLoading, isFetching, isError, refetch } = useIncidents(null, {
    platformScope: true,
  });
  const [editing, setEditing] = useState<Incident | null>(null);

  const form = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });

  const records = useMemo(
    () =>
      [...incidents].sort(
        (a, b) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime(),
      ),
    [incidents],
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditForm }) => updateIncident(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents", "platform"] });
      toast.success("Incidencia actualizada");
      setEditing(null);
    },
  });

  const columns: Column<Incident>[] = [
    {
      key: "title",
      header: "INCIDENCIA",
      sortable: true,
      render: (i) => (
        <div>
          <p className={tableCell.primary}>{i.title?.trim() || "Sin título"}</p>
          <p className={`${tableCell.secondary} line-clamp-2`}>{i.description}</p>
        </div>
      ),
    },
    {
      key: "severity",
      header: "SEVERIDAD",
      render: (i) => <span>{severityLabel(i.severity)}</span>,
    },
    {
      key: "status",
      header: "ESTADO",
      render: (i) => <span>{i.status?.trim() || "Abierta"}</span>,
    },
    {
      key: "clinic_id",
      header: "CLÍNICA",
      hideBelowMd: true,
      render: (i) => <span className={tableCell.muted}>{i.clinic_id || "—"}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (i) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              setEditing(i);
              form.reset({
                title: i.title?.trim() || "",
                description: i.description,
                severity: normalizeSeverity(i.severity),
                status: i.status?.trim() || "Abierta",
              });
            }}
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
        <h2 className="page-title">Incidencias</h2>
        <p className="page-description">Seguimiento y resolución de incidencias en todas las clínicas.</p>
      </div>

      <DataTable
        data={records}
        columns={columns}
        isLoading={isLoading || isFetching}
        isError={isError}
        onRetry={() => refetch()}
        searchKey="description"
        emptyTitle="Sin incidencias"
      />

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar incidencia</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((d) => {
              if (editing) updateMutation.mutate({ id: editing.id, data: d });
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Título</Label>
              <Input {...form.register("title")} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea rows={4} {...form.register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Severidad</Label>
                <Select
                  value={form.watch("severity")}
                  onValueChange={(v) => form.setValue("severity", v as EditForm["severity"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Baja</SelectItem>
                    <SelectItem value="MEDIUM">Media</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                    <SelectItem value="CRITICAL">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input {...form.register("status")} placeholder="Abierta, Resuelta…" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
