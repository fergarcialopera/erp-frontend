import { Boxes, Route, ScanLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Boxes,
    title: "Stock controlado",
    text: "Inventario por ubicación, movimientos y salidas con visibilidad operativa en cada ambiente.",
  },
  {
    icon: Route,
    title: "Trazabilidad completa",
    text: "Historial de movimientos y auditoría para saber qué salió, cuándo y quién lo registró.",
  },
  {
    icon: ScanLine,
    title: "Acceso inteligente",
    text: "Entrada por clínica y personal con PIN o credenciales, pensada para el ritmo del día a día.",
  },
];

export function FeatureGrid() {
  return (
    <section id="capacidades" className="ll-section bg-background">
      <div className="ll-container">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <p className="ll-eyebrow">Capacidades</p>
          <h2 className="ll-title text-[clamp(1.75rem,3.5vw,2.75rem)] text-foreground">
            Una plataforma, tres pilares
          </h2>
          <p className="mt-4 text-muted-foreground">
            Diseñada para equipos que necesitan control real del material sin fricción en el flujo de trabajo.
          </p>
        </div>

        <div className="grid gap-[22px] md:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="animate-fade-up p-6 md:p-8"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <CardContent className="p-0">
                  <div className="mb-5 inline-grid h-12 w-12 place-items-center rounded-[14px] bg-[hsla(167,90%,48%,0.12)] text-primary">
                    <Icon className="h-5 w-5" strokeWidth={2.25} />
                  </div>
                  <h3 className="font-heading text-[1.15rem] font-bold tracking-[-0.025em] text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-[0.96rem] leading-relaxed text-muted-foreground">
                    {feature.text}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
