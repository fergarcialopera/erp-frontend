import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const orderSchema = z.object({
  locker_id: z.string().min(1, "Selecciona un locker"),
  compartment_id: z.string().min(1, "Selecciona un compartimiento"),
  product_id: z.string().min(1, "Selecciona un producto"),
  quantity: z.coerce.number().min(1, "Mínimo 1").max(999, "Máximo 999"),
  external_ref: z.string().trim().min(1, "Referencia requerida").max(50),
});

type OrderForm = z.infer<typeof orderSchema>;

export default function NewOpenOrderPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
  });

  const onSubmit = async (data: OrderForm) => {
    // Will connect to API
    console.log("Order data:", data);
    toast.success("Orden creada exitosamente");
    navigate("/open-orders");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/open-orders")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="page-header mb-0">
          <h2 className="page-title">Nueva orden de apertura</h2>
          <p className="page-description">Solicitar apertura de compartimiento</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Locker</Label>
              <Select onValueChange={(v) => setValue("locker_id", v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Seleccionar locker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">LOC-A1 · Zona A - 1</SelectItem>
                  <SelectItem value="2">LOC-A2 · Zona A - 2</SelectItem>
                  <SelectItem value="3">LOC-B3 · Zona B - 3</SelectItem>
                  <SelectItem value="4">LOC-C1 · Zona C - 1</SelectItem>
                </SelectContent>
              </Select>
              {errors.locker_id && <p className="text-xs text-destructive">{errors.locker_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Compartimiento</Label>
              <Select onValueChange={(v) => setValue("compartment_id", v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Seleccionar compartimiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">A1-01</SelectItem>
                  <SelectItem value="2">A1-02</SelectItem>
                  <SelectItem value="3">A1-04</SelectItem>
                </SelectContent>
              </Select>
              {errors.compartment_id && <p className="text-xs text-destructive">{errors.compartment_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Producto</Label>
              <Select onValueChange={(v) => setValue("product_id", v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Guantes estériles L</SelectItem>
                  <SelectItem value="2">Jeringa 10ml</SelectItem>
                  <SelectItem value="3">Mascarilla N95</SelectItem>
                  <SelectItem value="4">Alcohol gel 500ml</SelectItem>
                </SelectContent>
              </Select>
              {errors.product_id && <p className="text-xs text-destructive">{errors.product_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-xs font-medium">Cantidad</Label>
              <Input id="quantity" type="number" min={1} className="h-10" placeholder="1" {...register("quantity")} />
              {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="external_ref" className="text-xs font-medium">Referencia externa</Label>
            <Input id="external_ref" className="h-10" placeholder="ORD-XXX" {...register("external_ref")} />
            {errors.external_ref && <p className="text-xs text-destructive">{errors.external_ref.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => navigate("/open-orders")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear orden"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
