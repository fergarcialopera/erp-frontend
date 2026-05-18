import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantityInputProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

function clampQuantity(value: number, min: number, max?: number) {
  let next = Math.max(min, value);
  if (max !== undefined) next = Math.min(max, next);
  return next;
}

export function QuantityInput({
  value,
  min = 0,
  max,
  onChange,
  disabled,
  className,
  "aria-label": ariaLabel = "Cantidad",
}: QuantityInputProps) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(String(value));
  }, [value, focused]);

  const commit = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "") {
      onChange(min);
      setText(String(min));
      return;
    }
    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isNaN(parsed)) {
      setText(String(value));
      return;
    }
    const next = clampQuantity(parsed, min, max);
    onChange(next);
    setText(String(next));
  };

  const step = (delta: number) => {
    const next = clampQuantity(value + delta, min, max);
    onChange(next);
    setText(String(next));
  };

  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <div
      className={cn("inline-flex", className)}
      role="group"
      aria-label={ariaLabel}
    >
      <div className="inline-flex items-stretch rounded-md border border-input bg-background shadow-sm overflow-hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-none border-r border-input hover:bg-muted"
          disabled={disabled || atMin}
          onClick={() => step(-1)}
          aria-label="Reducir cantidad"
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          value={focused ? text : String(value)}
          aria-label={ariaLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          className={cn(
            "h-8 w-11 shrink-0 border-0 bg-transparent px-0 text-center text-sm font-semibold tabular-nums",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          onFocus={(e) => {
            setFocused(true);
            setText(String(value));
            e.target.select();
          }}
          onBlur={() => {
            setFocused(false);
            commit(text);
          }}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, "");
            setText(next);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              step(1);
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              step(-1);
            }
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-none border-l border-input hover:bg-muted"
          disabled={disabled || atMax}
          onClick={() => step(1)}
          aria-label="Aumentar cantidad"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
