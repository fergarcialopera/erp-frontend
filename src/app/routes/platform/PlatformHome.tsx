import { Link } from "react-router-dom";
import { Building2, Users, Package, Lock, AlertTriangle } from "lucide-react";
import { platformNav } from "@/config/platformNavigation";
import { useClinics } from "@/features/clinics/queries";
import { useUsers } from "@/features/users/queries";
import { useProducts } from "@/features/products/queries";
import { useAmbientes } from "@/features/ambientes/queries";
import { useIncidents } from "@/features/incidents/queries";

const overviewIcons = {
  Building2,
  Users,
  Package,
  Lock,
  AlertTriangle,
} as const;

export default function PlatformHomePage() {
  const { data: clinics = [] } = useClinics();
  const { data: users = [] } = useUsers(null, { allowWithoutClinic: true });
  const { data: products = [] } = useProducts(null, { platformScope: true, activeOnly: false });
  const { data: ambientes = [] } = useAmbientes(null, { platformScope: true });
  const { data: incidents = [] } = useIncidents(null, { platformScope: true });

  const counts: Record<string, number | undefined> = {
    "/platform/clinics": clinics.length,
    "/platform/users": users.length,
    "/platform/products": products.length,
    "/platform/ambientes": ambientes.length,
    "/platform/incidents": incidents.length,
  };

  const cards = platformNav.filter((item) => item.url !== "/platform" && item.url !== "/platform/audit-logs");

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h2 className="page-title">Plataforma global</h2>
        <p className="page-description">
          Administra clínicas, usuarios, catálogo de productos, ambientes e incidencias del sistema.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((item) => {
          const Icon =
            item.url === "/platform/clinics"
              ? overviewIcons.Building2
              : item.url === "/platform/users"
                ? overviewIcons.Users
                : item.url === "/platform/products"
                  ? overviewIcons.Package
                  : item.url === "/platform/ambientes"
                    ? overviewIcons.Lock
                    : overviewIcons.AlertTriangle;

          return (
            <Link
              key={item.url}
              to={item.url}
              className="rounded-lg border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                {counts[item.url] !== undefined && (
                  <span className="text-2xl font-bold tabular-nums">{counts[item.url]}</span>
                )}
              </div>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
