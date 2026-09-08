import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { tableCell, TABLE_CHIP_CLASS } from "@/components/tableTypography";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  assignUserToClinic,
  patchClinicUserAccess,
  type ClinicUser,
} from "@/features/clinics/api";
import {
  clinicUsersAvailableQueryKey,
  clinicUsersQueryKey,
  useClinicUsers,
  useClinicUsersAvailable,
} from "@/features/clinics/queries";
import { toast } from "sonner";

const roleStyles: Record<string, string> = {
  ADMIN: "bg-accent/15 text-accent border-accent/25",
  TECHNICIAN: "bg-soft/30 text-soft-foreground border-soft/40",
  STAFF: "bg-muted text-muted-foreground border-border",
};

type Props = {
  clinicId: string;
};

export function ClinicUsersTab({ clinicId }: Props) {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading, isError, refetch } = useClinicUsers(clinicId);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const {
    data: available = [],
    isLoading: availableLoading,
  } = useClinicUsersAvailable(clinicId, undefined, assignOpen);

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: clinicUsersQueryKey(clinicId) });
    queryClient.invalidateQueries({ queryKey: clinicUsersAvailableQueryKey(clinicId) });
  };

  const assignMutation = useMutation({
    mutationFn: (userId: string) => assignUserToClinic(clinicId, userId),
    onSuccess: (user) => {
      toast.success(`«${user.name}» asignado a la clínica`);
      setSelectedUserId("");
      setAssignOpen(false);
      invalidateUsers();
    },
  });

  const accessMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      patchClinicUserAccess(clinicId, userId, isActive),
    onSuccess: (user) => {
      toast.success(
        user.is_active
          ? `Acceso habilitado para «${user.name}»`
          : `Acceso deshabilitado para «${user.name}»`,
      );
      invalidateUsers();
    },
  });

  const columns: Column<ClinicUser>[] = [
    {
      key: "name",
      header: "NOMBRE",
      sortable: true,
      render: (u) => (
        <div className="min-w-0">
          <span className={tableCell.primary}>{u.name}</span>
          <span className={`sm:hidden block ${tableCell.muted} truncate`}>{u.email}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "EMAIL",
      hideBelowSm: true,
      render: (u) => <span className={tableCell.muted}>{u.email}</span>,
    },
    {
      key: "role",
      header: "ROL",
      render: (u) => (
        <span className={`${TABLE_CHIP_CLASS} ${roleStyles[u.role] ?? roleStyles.STAFF}`}>
          {u.role}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "ACCESO",
      render: (u) => (
        <div className="flex items-center gap-3">
          <StatusBadge status={u.is_active ? "Activo" : "Deshabilitado"} type="active" />
          <Switch
            checked={u.is_active}
            disabled={accessMutation.isPending}
            onCheckedChange={(checked) =>
              accessMutation.mutate({ userId: u.id, isActive: checked })
            }
            aria-label={
              u.is_active ? `Deshabilitar acceso de ${u.name}` : `Habilitar acceso de ${u.name}`
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        searchKey="name"
        searchPlaceholder="Buscar usuario..."
        emptyTitle="Sin usuarios"
        emptyDescription="Asigna usuarios existentes a esta clínica."
        headerAction={
          <TableHeaderButton
            label="Añadir usuario"
            icon={<UserPlus />}
            onClick={() => {
              setSelectedUserId("");
              setAssignOpen(true);
            }}
          />
        }
      />

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Añadir usuario</DialogTitle>
            <DialogDescription>
              Solo se listan usuarios sin clínica asignada (ADMIN, TECHNICIAN o STAFF).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Usuario disponible</Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={availableLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={availableLoading ? "Cargando…" : "Seleccionar usuario"}
                />
              </SelectTrigger>
              <SelectContent>
                {available.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} · {u.email} ({u.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!availableLoading && available.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No hay usuarios disponibles para asignar.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!selectedUserId || assignMutation.isPending}
              onClick={() => assignMutation.mutate(selectedUserId)}
            >
              {assignMutation.isPending ? "Asignando…" : "Asignar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
