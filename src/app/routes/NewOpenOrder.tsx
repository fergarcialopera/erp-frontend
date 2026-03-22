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
import { useAuth } from "@/app/providers/useAuth";
import { useLockers, useLocker } from "@/features/lockers/queries";
import { useProducts } from "@/features/products/queries";
import { createOpenOrder } from "@/features/openOrders/api";
import { useQueryClient } from "@tanstack/react-query";

const orderSchema = z.object({
  locker_id: z.string().min(1, "Selecciona un locker"),
  compartment_id: z.string().min(1, "Selecciona un compartimiento"),
  product_id: z.string().min(1, "Selecciona un producto"),
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser mayor a 0").max(999, "Máximo 999"),
  external_ref: z.string().trim().max(50).optional(),
});

type OrderForm = z.infer<typeof orderSchema>;

export default function NewOpenOrderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clinicId } = useAuth();
  const { data: lockers = [] } = useLockers(clinicId);
  const { data: products = [] } = useProducts(clinicId);

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: { quantity: 1 },
  });

  const selectedLockerId = watch("locker_id");
  const { data: selectedLocker } = useLocker(selectedLockerId || null);
  const compartments = selectedLocker?.compartments ?? [];
  const activeLockers = lockers.filter((l) => l.is_active);
  const availableCompartments = compartments.filter((c) => c.status === "AVAILABLE" && c.is_active);
  const activeProducts = products.filter((p) => p.is_active);

  const onSubmit = async (data: OrderForm) => {
    try {
      await createOpenOrder({
        compartment_id: data.compartment_id,
        product_id: data.product_id,
        quantity: data.quantity,
      });
      toast.success("Orden creada", { description: "Reserva de stock procesada correctamente." });
      queryClient.invalidateQueries({ queryKey: ["dispenses", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", clinicId] });
      navigate("/open-orders", { replace: true });
    } catch {
      // Error ya mostrado por interceptor
    }
  };

  const onLockerChange = (value: string) => {
    setValue("locker_id", value);
    setValue("compartment_id", "");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Volver a órdenes de apertura"
          onClick={() => navigate("/open-orders")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="page-header mb-0">
          <h2 className="page-title">Nueva orden de apertura</h2>
          <p className="page-description">
            Solicitar apertura de compartimiento y reserva de stock
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="locker_id" className="text-xs font-medium">
                Locker (solo activos)
              </Label>
              <Select
                value={watch("locker_id")}
                onValueChange={onLockerChange}
                disabled={activeLockers.length === 0}
              >
                <SelectTrigger id="locker_id" className="h-10" aria-invalid={!!errors.locker_id}>
                  <SelectValue placeholder="Seleccionar locker" />
                </SelectTrigger>
                <SelectContent>
                  {activeLockers.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.code} · {l.name}
                      {l.location ? ` (${l.location})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.locker_id && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.locker_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="compartment_id" className="text-xs font-medium">
                Compartimiento (solo AVAILABLE y activos)
              </Label>
              <Select
                value={watch("compartment_id")}
                onValueChange={(v) => setValue("compartment_id", v)}
                disabled={!selectedLockerId || availableCompartments.length === 0}
              >
                <SelectTrigger
                  id="compartment_id"
                  className="h-10"
                  aria-invalid={!!errors.compartment_id}
                >
                  <SelectValue placeholder="Seleccionar compartimiento" />
                </SelectTrigger>
                <SelectContent>
                  {availableCompartments.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.compartment_id && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.compartment_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_id" className="text-xs font-medium">
                Producto a retirar
              </Label>
              <Select
                value={watch("product_id")}
                onValueChange={(v) => setValue("product_id", v)}
                disabled={activeProducts.length === 0}
              >
                <SelectTrigger id="product_id" className="h-10" aria-invalid={!!errors.product_id}>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {activeProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.product_id && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.product_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-xs font-medium">
                Cantidad (&gt; 0)
              </Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={999}
                className="h-10"
                placeholder="1"
                aria-invalid={!!errors.quantity}
                {...register("quantity")}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.quantity.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="external_ref" className="text-xs font-medium">
              Referencia externa (opcional, ej. historia clínica)
            </Label>
            <Input
              id="external_ref"
              className="h-10"
              placeholder="Ej. HC-12345"
              aria-invalid={!!errors.external_ref}
              {...register("external_ref")}
            />
            {errors.external_ref && (
              <p className="text-xs text-destructive" role="alert">
                {errors.external_ref.message}
              </p>
            )}
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
