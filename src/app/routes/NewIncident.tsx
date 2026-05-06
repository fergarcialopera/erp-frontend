import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
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
import { useAuth } from "@/app/providers/useAuth";
import { createIncident } from "@/features/incidents/api";

const incidentSchema = z.object({
  title: z.string().trim().max(120, "Máximo 120 caracteres").optional(),
  source: z.enum(["ERP", "LOCKER"], { required_error: "Selecciona el origen de la incidencia" }),
  description: z
    .string()
    .trim()
    .min(5, "Describe la incidencia con más detalle")
    .max(800, "Máximo 800 caracteres"),
});

type IncidentForm = z.infer<typeof incidentSchema>;

export default function NewIncidentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clinicId } = useAuth();

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IncidentForm>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      source: "ERP",
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: IncidentForm) => {
    try {
      await createIncident({
        source: data.source,
        description: data.description,
        title: data.title || undefined,
      });
      toast.success("Incidencia registrada", {
        description: "La incidencia se guardó correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["incidents", clinicId] });
      navigate("/incidents", { replace: true });
    } catch {
      // El interceptor de axios ya muestra el error del backend.
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Volver al listado de incidencias"
          onClick={() => navigate("/incidents")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="page-header mb-0">
          <h2 className="page-title">Nueva incidencia</h2>
          <p className="page-description">Reporta una incidencia detectada en ERP o en locker físico</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="source" className="text-xs font-medium">
              Origen
            </Label>
            <Select value={watch("source")} onValueChange={(v) => setValue("source", v as "ERP" | "LOCKER")}>
              <SelectTrigger id="source" className="h-10" aria-invalid={!!errors.source}>
                <SelectValue placeholder="Selecciona un origen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ERP">Sistema ERP</SelectItem>
                <SelectItem value="LOCKER">Locker físico</SelectItem>
              </SelectContent>
            </Select>
            {errors.source && (
              <p className="text-xs text-destructive" role="alert">
                {errors.source.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-medium">
              Título (opcional)
            </Label>
            <Input
              id="title"
              className="h-10"
              placeholder="Ej: Error al abrir compartimento"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-medium">
              Descripción
            </Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Describe qué ocurrió, en qué momento y cualquier detalle útil para su resolución."
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => navigate("/incidents")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar incidencia"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
