import { Badge } from "@/components/ui/badge";

const ROWS = [
  { sku: "SKU-1042", product: "Kit quirúrgico A", location: "Quirófano 2", status: "ok" as const },
  { sku: "SKU-2088", product: "Sensor RFID", location: "Almacén B", status: "ok" as const },
  { sku: "SKU-3310", product: "Material fungible", location: "Consulta 1", status: "warn" as const },
];

export function DashboardMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/16 bg-white/95 p-[18px] text-left shadow-hero">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Vista operativa
          </p>
          <p className="font-heading text-lg font-bold tracking-tight text-foreground">
            Inventario en tiempo real
          </p>
        </div>
        <Badge variant="success">Sincronizado</Badge>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Referencias", value: "1.284", accent: false },
          { label: "Ubicaciones", value: "46", accent: false },
          { label: "Alertas", value: "3", accent: true },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border border-border bg-background p-3.5">
            <p className="text-[0.82rem] font-bold text-muted-foreground">{metric.label}</p>
            <p
              className={`mt-1 font-heading text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-none tracking-[-0.05em] ${
                metric.accent ? "text-primary" : "text-foreground"
              }`}
            >
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full w-[72%] rounded-full bg-gradient-to-r from-primary to-primary-hover"
          aria-hidden
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[480px] border-collapse bg-card text-left">
          <thead>
            <tr>
              {["SKU", "Producto", "Ubicación", "Estado"].map((h) => (
                <th
                  key={h}
                  className="border-b border-border px-3 py-3 text-[0.78rem] font-extrabold uppercase tracking-[0.04em] text-muted-foreground sm:px-4"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.sku}>
                <td className="border-b border-border px-3 py-3 font-mono text-xs text-muted-foreground sm:px-4">
                  {row.sku}
                </td>
                <td className="border-b border-border px-3 py-3 text-sm text-foreground sm:px-4">
                  {row.product}
                </td>
                <td className="border-b border-border px-3 py-3 text-sm text-foreground sm:px-4">
                  {row.location}
                </td>
                <td className="border-b border-border px-3 py-3 sm:px-4 last:border-b-0">
                  <Badge variant={row.status === "ok" ? "success" : "warning"}>
                    {row.status === "ok" ? "OK" : "Revisar"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
