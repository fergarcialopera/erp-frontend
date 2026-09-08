import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactDialog } from "./ContactDialog";

type IllustrationKind = "rows" | "bars" | "chart";

interface SoftwareFeature {
  title: string;
  lead: string;
  text: string;
  kind: IllustrationKind;
  accent: string;
}

const FEATURES: SoftwareFeature[] = [
  {
    title: "Gestión de Inventario",
    lead: "Control en tiempo real.",
    text: "Monitorea niveles de stock, alertas de mínimo y ubicaciones desde cualquier dispositivo.",
    kind: "rows",
    accent: "#8B93F8",
  },
  {
    title: "Auditoría",
    lead: "Trazabilidad inalterable.",
    text: "Registro automático de quién, cuándo y qué se retira.",
    kind: "bars",
    accent: "#F87E7E",
  },
  {
    title: "Cloud Security",
    lead: "Permisos de usuario.",
    text: "Controla quién accede con permisos restringidos por perfil.",
    kind: "rows",
    accent: "#F6C445",
  },
  {
    title: "Control del Gasto",
    lead: "Adiós al desperdicio.",
    text: "Analiza consumos para reducir mermas al instante.",
    kind: "bars",
    accent: "#5BC8F5",
  },
  {
    title: "Integración Personalizada",
    lead: "Ecosistema conectado.",
    text: "Sincroniza LogiLock con tu ERP o software de gestión.",
    kind: "chart",
    accent: "#4FADF7",
  },
  {
    title: "Alertas Inteligentes",
    lead: "Predicciones inteligentes.",
    text: "Analiza el historial y recibe alertas de stock bajo.",
    kind: "rows",
    accent: "#5AD8A6",
  },
];

function RowsIllustration({ accent }: { accent: string }) {
  const rows = [
    { bar: "58%", pill: false },
    { bar: "42%", pill: true },
    { bar: "64%", pill: false },
    { bar: "36%", pill: true },
  ];
  return (
    <div className="space-y-2.5">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span className="h-3.5 w-3.5 shrink-0 rounded-[5px] bg-muted" />
          <span className="h-2.5 rounded-full bg-muted" style={{ width: row.bar }} />
          <span
            className="ml-auto h-4 w-12 shrink-0 rounded-md"
            style={{ backgroundColor: row.pill ? accent : "hsl(var(--muted))", opacity: row.pill ? 0.85 : 1 }}
          />
        </div>
      ))}
    </div>
  );
}

function BarsIllustration({ accent }: { accent: string }) {
  const widths = ["82%", "58%", "70%", "38%", "52%"];
  return (
    <div className="space-y-2.5">
      {widths.map((width, i) => (
        <div
          key={i}
          className="h-3.5 rounded-md"
          style={{
            width,
            backgroundColor: accent,
            opacity: i % 2 === 0 ? 0.8 : 0.35,
          }}
        />
      ))}
    </div>
  );
}

function ChartIllustration({ accent }: { accent: string }) {
  const heights = [64, 40, 52, 30, 44];
  return (
    <div className="flex items-end gap-4">
      <div
        className="h-16 w-16 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(${accent} 0 62%, hsl(var(--muted)) 62% 100%)`,
          mask: "radial-gradient(circle, transparent 42%, black 43%)",
          WebkitMask: "radial-gradient(circle, transparent 42%, black 43%)",
        }}
      />
      <div className="flex flex-1 items-end gap-2">
        {heights.map((height, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height, backgroundColor: accent, opacity: i === 0 ? 0.9 : 0.45 }}
          />
        ))}
      </div>
    </div>
  );
}

function FeatureIllustration({ kind, accent }: { kind: IllustrationKind; accent: string }) {
  return (
    <div className="mb-6 rounded-xl border border-border bg-background p-4">
      {kind === "rows" && <RowsIllustration accent={accent} />}
      {kind === "bars" && <BarsIllustration accent={accent} />}
      {kind === "chart" && <ChartIllustration accent={accent} />}
    </div>
  );
}

export function SoftwareSection() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <section id="software" className="ll-section bg-background">
      <div className="ll-container">
        <div className="mx-auto mb-10 max-w-xl text-center md:mb-14">
          <h2 className="ll-title text-[clamp(1.75rem,3.5vw,2.5rem)] text-foreground">
            Inventory Cloud: La potencia de un almacén 100% digital.
          </h2>
        </div>

        <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Card
              key={feature.title}
              className="animate-fade-up p-6"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <CardContent className="p-0">
                <FeatureIllustration kind={feature.kind} accent={feature.accent} />
                <h3 className="font-heading text-[1.08rem] font-bold tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-muted-foreground">
                  <strong className="font-semibold text-foreground">{feature.lead}</strong>{" "}
                  {feature.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </section>
  );
}
