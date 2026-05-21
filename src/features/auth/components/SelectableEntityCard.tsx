import { EntityAvatar } from "@/components/EntityAvatar";
import { cn } from "@/lib/utils";

interface SelectableEntityCardProps {
  name: string;
  subtitle?: string;
  imageUrl?: string | null;
  displayInitial?: string;
  selected?: boolean;
  /** Cuadrícula (personal) o fila a ancho completo (clínicas). */
  layout?: "grid" | "row";
  onClick: () => void;
}

export function SelectableEntityCard({
  name,
  subtitle,
  imageUrl,
  displayInitial,
  selected,
  layout = "grid",
  onClick,
}: SelectableEntityCardProps) {
  const isRow = layout === "row";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border transition-colors w-full",
        "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary bg-primary/5 ring-1 ring-primary",
        isRow
          ? "flex flex-row items-center gap-3 p-3 text-left"
          : "flex flex-col items-center gap-2 p-4 text-center",
      )}
    >
      <EntityAvatar
        name={name}
        imageUrl={imageUrl}
        displayInitial={displayInitial}
        className={isRow ? "h-10 w-10 shrink-0" : undefined}
        fallbackClassName={isRow ? "text-base" : undefined}
      />
      <div className={cn("min-w-0", isRow ? "flex-1" : "w-full")}>
        <p className="text-sm font-medium truncate">{name}</p>
        {subtitle ? (
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{subtitle}</p>
        ) : null}
      </div>
    </button>
  );
}
