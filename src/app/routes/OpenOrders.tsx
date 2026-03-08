import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/useAuth";
import { useOpenOrders } from "@/features/openOrders/queries";
import { confirmReadOpenOrder } from "@/features/openOrders/api";
import { useProducts } from "@/features/products/queries";
import { useUsers } from "@/features/users/queries";
import { Check } from "lucide-react";
import { toast } from "sonner";
import type { OpenOrder } from "@/types/models";

/** Fila de orden con datos enriquecidos para mostrar nombres */
type OpenOrderRow = OpenOrder & {
  product_name?: string;
  product_sku?: string;
  requested_by_user_name?: string;
};

const baseColumns = (
  onConfirm: (order: OpenOrderRow) => void,
  confirmingId: string | null
): Column<OpenOrderRow>[] => [
  {
    key: "product_id",
    header: "ID producto",
    sortable: true,
    render: (o) => (
      <span className="font-mono text-xs text-muted-foreground">
        {o.product_sku ?? o.product_id}
      </span>
    ),
  },
  {
    key: "product_name",
    header: "Producto",
    sortable: true,
    render: (o) => (
      <span className="text-sm">{o.product_name ?? o.product_id}</span>
    ),
  },
  {
    key: "quantity",
    header: "Cantidad",
    sortable: true,
    render: (o) => <span className="tabular-nums">{o.quantity}</span>,
  },
  {
    key: "status",
    header: "Estado",
    sortable: true,
    render: (o) => <StatusBadge status={o.status} type="order" />,
  },
  {
    key: "requested_by_user_name",
    header: "Responsable",
    sortable: true,
    render: (o) => (
      <span className="text-sm">{o.requested_by_user_name ?? o.requested_by_user_id}</span>
    ),
  },
  {
    key: "requested_at",
    header: "Retirado",
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
    header: "Confirmado",
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
  const isLoading = ordersLoading || ordersFetching;
  const { data: products = [] } = useProducts(clinicId, { activeOnly: false });
  const { data: users = [] } = useUsers(clinicId);

  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmReadOpenOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["openOrders", clinicId] });
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
    const productMap = new Map(products.map((p) => [p.id, p]));
    const userMap = new Map(users.map((u) => [u.id, u]));
    return orders.map((order) => {
      const product = productMap.get(order.product_id);
      const user = userMap.get(order.requested_by_user_id);
      return {
        ...order,
        product_name: product?.name ?? order.product_name,
        product_sku: product?.sku ?? order.product_sku,
        requested_by_user_name: user?.name ?? order.requested_by_user_name,
      };
    });
  }, [orders, products, users]);

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
