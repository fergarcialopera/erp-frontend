/** Tipografía responsive para cabeceras y celdas de tablas (móvil más compacta). */
export const TABLE_HEAD_CLASS =
  "text-[10px] sm:text-[11px] uppercase tracking-wide sm:tracking-wider font-semibold text-muted-foreground leading-tight";

export const tableCell = {
  primary: "font-medium text-xs sm:text-sm leading-snug",
  secondary: "text-[11px] sm:text-xs text-muted-foreground leading-snug",
  mono: "font-mono text-[11px] sm:text-xs leading-snug",
  numeric: "tabular-nums text-xs sm:text-sm leading-snug",
  muted: "text-[11px] sm:text-xs text-muted-foreground leading-snug",
} as const;

/** Chips/badges dentro de tablas. */
export const TABLE_CHIP_CLASS =
  "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] sm:text-[11px] font-medium border leading-tight";
