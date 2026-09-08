import { fieldLabel, formatDiffValue } from "../labels";
import type { ProductImportDiffValue } from "../types";

interface ImportConflictDiffProps {
  diff: Record<string, ProductImportDiffValue> | null;
}

export function ImportConflictDiff({ diff }: ImportConflictDiffProps) {
  if (!diff || Object.keys(diff).length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Sin diferencias de campo visibles. La clave de conflicto es la referencia interna.
      </p>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/40 text-muted-foreground">
            <th className="text-left font-medium px-2 py-1.5">Campo</th>
            <th className="text-left font-medium px-2 py-1.5">Actual</th>
            <th className="text-left font-medium px-2 py-1.5">CSV</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(diff).map(([field, values]) => (
            <tr key={field} className="border-t">
              <td className="px-2 py-1.5 font-medium whitespace-nowrap">{fieldLabel(field)}</td>
              <td className="px-2 py-1.5 text-muted-foreground break-all">
                {formatDiffValue(values.current)}
              </td>
              <td className="px-2 py-1.5 break-all">{formatDiffValue(values.incoming)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-2 py-1.5 text-[11px] text-muted-foreground border-t bg-muted/20">
        «Actualizar existente» hace un merge no destructivo: los vacíos del CSV no borran datos
        actuales.
      </p>
    </div>
  );
}
