import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/providers/useAuth";
import { useProducts } from "@/features/products/queries";
import { ProductStockLocationsPanel } from "@/features/products/components/ProductStockLocationsPanel";
import { useAmbientesTree } from "@/features/ambientes/queries";
import { createEntryLog } from "@/features/entryLogs/api";
import { isClinicOperableProduct } from "@/features/inventory/components/entryProductEligibility";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { Ambiente, Product } from "@/types/models";

const LOCATION_NONE = "__none__";
const PRODUCT_RESULT_LIMIT = 30;

/** Ambientes operativos para ubicar entradas (visibles en clínica). */
function isOperableAmbiente(ambiente: Ambiente): boolean {
  if (!ambiente.is_active) return false;
  if (ambiente.is_visible === undefined) return true;
  return ambiente.is_visible === true;
}

function matchesProductQuery(product: Product, query: string): boolean {
  const haystack = [product.name, product.sku, product.barcode, product.internal_reference]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

const entrySchema = z.object({
  product_id: z.string().min(1, "Selecciona un producto"),
  zone_id: z.string().optional(),
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser mayor a 0").max(999, "Máximo 999"),
  note: z.string().trim().max(120).optional(),
});

type EntryForm = z.infer<typeof entrySchema>;

interface NewEntryLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewEntryLogDialog({ open, onOpenChange }: NewEntryLogDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clinicId } = useAuth();
  const { data: products = [], isLoading: productsLoading } = useProducts(clinicId);
  const { data: ambienteTree = [], isLoading: ambienteTreeLoading } = useAmbientesTree(clinicId, {
    enabled: open,
  });
  const clinicProducts = useMemo(
    () => products.filter(isClinicOperableProduct),
    [products],
  );
  const hasClinicProducts = clinicProducts.length > 0;
  const activeAmbientes = useMemo(() => ambienteTree.filter(isOperableAmbiente), [ambienteTree]);
  const [filterAmbienteId, setFilterAmbienteId] = useState<string | undefined>();
  const [productQuery, setProductQuery] = useState("");
  const deferredProductQuery = useDeferredValue(productQuery);

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EntryForm>({
    resolver: zodResolver(entrySchema),
    defaultValues: { quantity: 1 },
  });

  const selectedAmbiente = activeAmbientes.find((a) => a.id === filterAmbienteId);
  const activeZones = (selectedAmbiente?.zones ?? []).filter((z) => z.is_active);
  const selectedProductId = watch("product_id");
  const selectedProduct = clinicProducts.find((p) => p.id === selectedProductId);

  const filteredProducts = useMemo(() => {
    const q = deferredProductQuery.trim().toLowerCase();
    const list = q
      ? clinicProducts.filter((p) => matchesProductQuery(p, q))
      : clinicProducts;
    return list.slice(0, PRODUCT_RESULT_LIMIT);
  }, [deferredProductQuery, clinicProducts]);

  useEffect(() => {
    if (open) {
      reset({ quantity: 1, note: "", zone_id: undefined, product_id: "" });
      setFilterAmbienteId(undefined);
      setProductQuery("");
    }
  }, [open, reset]);

  const close = () => onOpenChange(false);

  const goToProducts = () => {
    close();
    navigate("/products");
  };

  const selectProduct = (product: Product) => {
    setValue("product_id", product.id, { shouldValidate: true, shouldDirty: true });
    setProductQuery("");
  };

  const clearProduct = () => {
    setValue("product_id", "", { shouldValidate: true, shouldDirty: true });
    setProductQuery("");
  };

  const onSubmit = async (data: EntryForm) => {
    const product = clinicProducts.find((p) => p.id === data.product_id);
    if (!product?.sku) {
      toast.error("Producto inválido", {
        description: "No se pudo resolver el SKU del producto seleccionado.",
      });
      return;
    }

    const zone = data.zone_id
      ? activeZones.find((z) => z.id === data.zone_id)
      : undefined;

    try {
      await createEntryLog({
        sku: product.sku,
        name: product.name,
        quantity: data.quantity,
        note: data.note,
        ...(zone
          ? {
              zone_id: zone.id,
              ambiente_id: zone.ambiente_id || filterAmbienteId,
            }
          : {}),
      });
      toast.success("Entrada registrada", {
        description: "El movimiento de entrada se registró correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["products", "stock-locations"] });
      queryClient.invalidateQueries({ queryKey: ["ambientes", "tree", clinicId] });
      close();
    } catch {
      // Error mostrado por interceptor
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva entrada de stock</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="entry-product-search" className="text-xs font-medium">
                Producto a ingresar
              </Label>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0 text-xs"
                onClick={goToProducts}
              >
                Ir a productos
              </Button>
            </div>

            {!productsLoading && !hasClinicProducts && (
              <p
                className="rounded-md border border-dashed bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground"
                role="status"
              >
                No hay productos disponibles para esta clínica. Activa productos en la sección
                Productos para poder registrar entradas.
              </p>
            )}

            {selectedProduct ? (
              <div className="flex items-start justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{selectedProduct.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    SKU: {selectedProduct.sku}
                    {selectedProduct.barcode ? ` · ${selectedProduct.barcode}` : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={clearProduct}
                  aria-label="Quitar producto seleccionado"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : hasClinicProducts || productsLoading ? (
              <>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    id="entry-product-search"
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    placeholder="Buscar por nombre, SKU o código…"
                    className="h-10 pl-10 pr-10"
                    disabled={productsLoading || !hasClinicProducts}
                    aria-invalid={!!errors.product_id}
                    autoComplete="off"
                  />
                  {productQuery.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0.5 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setProductQuery("")}
                      aria-label="Borrar búsqueda"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div
                  className="max-h-40 overflow-y-auto rounded-md border bg-background"
                  role="listbox"
                  aria-label="Resultados de productos"
                >
                  {productsLoading ? (
                    <p className="px-3 py-2.5 text-xs text-muted-foreground">Cargando productos…</p>
                  ) : filteredProducts.length === 0 ? (
                    <p className="px-3 py-2.5 text-xs text-muted-foreground">
                      Sin resultados para «{productQuery.trim()}».
                    </p>
                  ) : (
                    <ul className="py-1">
                      {filteredProducts.map((product) => (
                        <li key={product.id}>
                          <button
                            type="button"
                            role="option"
                            className={cn(
                              "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left",
                              "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none",
                            )}
                            onClick={() => selectProduct(product)}
                          >
                            <span className="text-sm font-medium truncate w-full">{product.name}</span>
                            <span className="text-xs text-muted-foreground truncate w-full">
                              {product.sku}
                              {product.barcode ? ` · ${product.barcode}` : ""}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : null}

            {errors.product_id && hasClinicProducts && (
              <p className="text-xs text-destructive" role="alert">
                {errors.product_id.message}
              </p>
            )}
            <ProductStockLocationsPanel productId={selectedProductId || undefined} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-quantity" className="text-xs font-medium">
              Cantidad
            </Label>
            <Input
              id="entry-quantity"
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
            <Label htmlFor="entry-note" className="text-xs font-medium">
              Nota <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="entry-note"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry-filter-ambiente" className="text-xs font-medium">
                Ambiente <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Select
                value={filterAmbienteId ?? LOCATION_NONE}
                onValueChange={(v) => {
                  setFilterAmbienteId(v === LOCATION_NONE ? undefined : v);
                  setValue("zone_id", undefined);
                }}
                disabled={ambienteTreeLoading || activeAmbientes.length === 0}
              >
                <SelectTrigger id="entry-filter-ambiente" className="h-10">
                  <SelectValue placeholder="Sin ambiente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LOCATION_NONE}>Sin ambiente</SelectItem>
                  {activeAmbientes.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-zone_id" className="text-xs font-medium">
                Zona <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Select
                value={watch("zone_id") ?? LOCATION_NONE}
                onValueChange={(v) =>
                  setValue("zone_id", v === LOCATION_NONE ? undefined : v)
                }
                disabled={
                  ambienteTreeLoading ||
                  !filterAmbienteId ||
                  activeZones.length === 0
                }
              >
                <SelectTrigger
                  id="entry-zone_id"
                  className="h-10"
                  aria-invalid={!!errors.zone_id}
                >
                  <SelectValue
                    placeholder={
                      ambienteTreeLoading
                        ? "Cargando ambientes…"
                        : !filterAmbienteId
                          ? "Opcional tras elegir ambiente"
                          : activeZones.length === 0
                            ? "Sin zonas en este ambiente"
                            : "Sin zona"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LOCATION_NONE}>Sin zona</SelectItem>
                  {activeZones.map((z) => (
                    <SelectItem key={z.id} value={z.id}>
                      {z.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.zone_id && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.zone_id.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !hasClinicProducts}>
              {isSubmitting ? "Registrando..." : "Registrar entrada"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
