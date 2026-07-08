import { Link } from "react-router-dom";
import { History, KeyRound } from "lucide-react";
import { auditBasePath, type AuditScopeProps } from "./auditPaths";

const auditOptions = [
  {
    key: "access",
    title: "Accesos",
    description: "Inicios de sesión, autenticación y eventos de acceso al sistema.",
    icon: KeyRound,
  },
  {
    key: "activity",
    title: "Actividad",
    description: "Altas, ediciones y bajas de entidades del ERP (productos, usuarios, inventario…).",
    icon: History,
  },
] as const;

export default function AuditLogsHub({ platformScope = false }: AuditScopeProps) {
  const base = auditBasePath(platformScope);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Registro de auditoría</h2>
        <p className="page-description">
          Consulta el historial de accesos y la actividad registrada en el sistema.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {auditOptions.map((option) => (
          <Link
            key={option.key}
            to={`${base}/${option.key}`}
            className="rounded-lg border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/5"
          >
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <option.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">{option.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
