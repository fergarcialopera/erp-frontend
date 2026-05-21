import { EntityAvatar } from "@/components/EntityAvatar";
import { cn } from "@/lib/utils";

interface SelectableEntityCardProps {
  name: string;
  subtitle?: string;
  imageUrl?: string | null;
  displayInitial?: string;
  selected?: boolean;
  onClick: () => void;
}

export function SelectableEntityCard({
  name,
  subtitle,
  imageUrl,
  displayInitial,
  selected,
  onClick,
}: SelectableEntityCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors",
        "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary bg-primary/5 ring-1 ring-primary",
      )}
    >
      <EntityAvatar name={name} imageUrl={imageUrl} displayInitial={displayInitial} />
      <div className="min-w-0 w-full">
        <p className="text-sm font-medium truncate">{name}</p>
        {subtitle ? (
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{subtitle}</p>
        ) : null}
      </div>
    </button>
  );
}
