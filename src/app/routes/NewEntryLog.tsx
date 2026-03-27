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
import { useProducts } from "@/features/products/queries";
import { addInventory } from "@/features/inventory/api";
import { useQueryClient } from "@tanstack/react-query";

const entrySchema = z.object({
  product_id: z.string().min(1, "Selecciona un producto"),
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser mayor a 0").max(999, "Máximo 999"),
  note: z.string().trim().max(120).optional(),
});

type EntryForm = z.infer<typeof entrySchema>;

export default function NewEntryLogPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clinicId } = useAuth();
  const { data: products = [] } = useProducts(clinicId);
  const activeProducts = products.filter((p) => p.is_active);

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EntryForm>({
    resolver: zodResolver(entrySchema),
    defaultValues: { quantity: 1 },
  });

  const onSubmit = async (data: EntryForm) => {
    const selectedProduct = products.find((p) => p.id === data.product_id);
    if (!selectedProduct?.sku) {
      toast.error("Producto inválido", { description: "No se pudo resolver el SKU del producto seleccionado." });
      return;
    }

    try {
      await addInventory({
        sku: selectedProduct.sku,
        name: selectedProduct.name,
        quantity: data.quantity,
        note: data.note,
      });
      toast.success("Entrada registrada", { description: "El movimiento de entrada se registró correctamente." });
      queryClient.invalidateQueries({ queryKey: ["inventory", clinicId] });
      navigate("/inventory", { replace: true });
    } catch {
      // Error mostrado por interceptor
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Volver a inventario"
          onClick={() => navigate("/inventory")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="page-header mb-0">
          <h2 className="page-title">Nueva entrada de stock</h2>
          <p className="page-description">Registrar entrada de stock para un producto</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="product_id" className="text-xs font-medium">
              Producto a ingresar
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

          <div className="space-y-2">
            <Label htmlFor="note" className="text-xs font-medium">
              Nota (opcional)
            </Label>
            <Input
              id="note"
              className="h-10"
              placeholder="Motivo o referencia"
              aria-invalid={!!errors.note}
              {...register("note")}
            />
            {errors.note && (
              <p className="text-xs text-destructive" role="alert">
                {errors.note.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => navigate("/inventory")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar entrada"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
