import { catalogPreviewKeyLabel } from "../labels";

interface ImportCatalogPreviewProps {
  preview: Record<string, string[]>;
}

export function ImportCatalogPreview({ preview }: ImportCatalogPreviewProps) {
  const entries = Object.entries(preview).filter(([, names]) => names.length > 0);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No se crearán entidades nuevas de catálogo al confirmar.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([key, names]) => (
        <div key={key} className="rounded-md border bg-muted/20 px-3 py-2">
          <div className="text-xs font-semibold text-muted-foreground mb-1">
            {catalogPreviewKeyLabel(key)} ({names.length})
          </div>
          <ul className="text-sm space-y-0.5 max-h-28 overflow-y-auto">
            {names.map((name) => (
              <li key={`${key}-${name}`} className="truncate" title={name}>
                {name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
