import { productImportIssueLabel } from "../labels";
import type { ProductImportIssue } from "../types";

interface ImportIssueListProps {
  issues: ProductImportIssue[];
  emptyText?: string;
  variant?: "error" | "warning";
}

export function ImportIssueList({ issues, emptyText, variant = "error" }: ImportIssueListProps) {
  if (issues.length === 0) {
    return emptyText ? <p className="text-sm text-muted-foreground">{emptyText}</p> : null;
  }

  const color =
    variant === "warning"
      ? "border-[hsla(36,100%,65%,0.35)] bg-[hsla(36,100%,65%,0.08)] text-[hsl(var(--ll-warning-700))]"
      : "border-destructive/25 bg-destructive/5 text-destructive";

  return (
    <ul className="space-y-2">
      {issues.map((issue, index) => (
        <li
          key={`${issue.code}-${issue.column ?? ""}-${index}`}
          className={`rounded-md border px-3 py-2 text-sm ${color}`}
        >
          {productImportIssueLabel(issue.code, issue.column)}
        </li>
      ))}
    </ul>
  );
}
