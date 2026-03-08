import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/useAuth";
import { useOpenOrders } from "@/features/openOrders/queries";
import { confirmReadOrder } from "@/features/openOrders/api";
import { Check } from "lucide-react";
import { toast } from "sonner";
import type { OpenOrder } from "@/types/models";

/** Helper: texto de producto desde order enriquecido o fallback */
function orderProductSku(o: OpenOrder): string {
  return o.product?.sku ?? o.product_sku ?? o.product_id ?? "—";
}
function orderProductName(o: OpenOrder): string {
  return o.product?.name ?? o.product_name ?? o.product_id ?? "—";
}
function orderLockerDisplay(o: OpenOrder): string {
  return o.locker?.code ?? o.locker_code ?? o.locker?.name ?? o.locker_name ?? o.locker_id ?? "—";
}
function orderCompartmentDisplay(o: OpenOrder): string {
  return o.compartment?.code ?? o.compartment_code ?? o.compartment_name ?? o.compartment_id ?? "—";
}
function orderRequestedByDisplay(o: OpenOrder): string {
  return o.requested_by?.name ?? o.requested_by_user_name ?? o.requested_by_user_id ?? "—";
}

type OpenOrderRow = OpenOrder;

const baseColumns = (
  onConfirm: (order: OpenOrderRow) => void,
  confirmingId: string | null
): Column<OpenOrderRow>[] => [
  {
    key: "product_id",
    header: "ID PRODUCTO",
    sortable: true,
    render: (o) => (
      <span className="font-mono text-xs text-muted-foreground">
        {orderProductSku(o)}
      </span>
    ),
  },
  {
    key: "product_name",
    header: "PRODUCTO",
    sortable: true,
    render: (o) => (
      <span className="text-sm">{orderProductName(o)}</span>
    ),
  },
  {
    key: "quantity",
    header: "CANTIDAD",
    sortable: true,
    render: (o) => <span className="tabular-nums">{o.quantity}</span>,
  },
  {
    key: "locker_name",
    header: "LOCKER",
    sortable: true,
    render: (o) => (
      <span className="text-sm font-mono">
        {orderLockerDisplay(o)}
      </span>
    ),
  },
  {
    key: "compartment_name",
    header: "COMPARTIMENTO",
    sortable: true,
    render: (o) => (
      <span className="text-sm font-mono">
        {orderCompartmentDisplay(o)}
      </span>
    ),
  },
  {
    key: "status",
    header: "ESTADO",
    sortable: true,
    render: (o) => <StatusBadge status={o.status} type="order" />,
  },
  {
    key: "requested_by_user_name",
    header: "RESPONSABLE",
    sortable: true,
    render: (o) => (
      <span className="text-sm">{orderRequestedByDisplay(o)}</span>
    ),
  },
  {
    key: "requested_at",
    header: "RETIRADO",
    sortable: true,
    render: (o) => (
      <span className="text-xs text-muted-foreground">
        {new Date(o.requested_at).toLocaleString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    ),
  },
  {
    key: "read_at",
    header: "CONFIRMADO",
    sortable: true,
    render: (o) => (
      <span className="text-xs text-muted-foreground">
        {o.read_at
          ? new Date(o.read_at).toLocaleString("es-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—"}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    sortable: false,
    render: (o) =>
      o.status === "PENDING" ? (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onConfirm(o)}
            disabled={confirmingId === o.id}
            aria-label={`Confirmar retirada de orden ${o.external_ref}`}
          >
            {confirmingId === o.id ? (
              <span className="animate-pulse">...</span>
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      ) : null,
  },
];

export default function OpenOrdersPage() {
  const queryClient = useQueryClient();
  const { clinicId } = useAuth();
  const {
    data: orders = [],
    isLoading: ordersLoading,
    isFetching: ordersFetching,
    isError,
    refetch,
  } = useOpenOrders(clinicId);

  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmReadOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", clinicId] });
      toast.success("Retirada confirmada", {
        description: "La orden se ha marcado como retirada correctamente.",
      });
    },
  });

  const handleConfirmRetirement = (order: OpenOrderRow) => {
    confirmMutation.mutate(order.id);
  };

  const confirmingId =
    confirmMutation.isPending && confirmMutation.variables != null
      ? confirmMutation.variables
      : null;
  const columns = useMemo(
    () => baseColumns(handleConfirmRetirement, confirmingId),
    [confirmingId]
  );

  const records: OpenOrderRow[] = useMemo(() => {
    const sorted = [...orders].sort(
      (a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
    );
    return sorted.map((o) => ({
      ...o,
      product_name: orderProductName(o),
      product_sku: orderProductSku(o),
      locker_code: orderLockerDisplay(o),
      compartment_code: orderCompartmentDisplay(o),
      requested_by_user_name: orderRequestedByDisplay(o),
    }));
  }, [orders]);

  const isLoading = ordersLoading || ordersFetching;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Órdenes de retirada</h2>
        <p className="page-description">Registro de órdenes de retirada de productos</p>
      </div>

      <DataTable
        data={records}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="product_name"
        searchPlaceholder="Buscar por producto..."
        emptyTitle="Sin órdenes"
        emptyDescription="No hay órdenes de retirada registradas."
      />
    </div>
  );
}
