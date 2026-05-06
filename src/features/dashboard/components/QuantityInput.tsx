import { Input } from "@/components/ui/input";

interface QuantityInputProps {
  value: number;
  min?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function QuantityInput({ value, min = 0, onChange, disabled }: QuantityInputProps) {
  return (
    <Input
      type="number"
      min={min}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => {
        const next = Number(e.target.value);
        onChange(Number.isNaN(next) ? min : Math.max(min, next));
      }}
      disabled={disabled}
      className="h-9 w-24"
    />
  );
}
