import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface EntityAvatarProps {
  name: string;
  imageUrl?: string | null;
  displayInitial?: string;
  className?: string;
  fallbackClassName?: string;
}

export function EntityAvatar({
  name,
  imageUrl,
  displayInitial,
  className,
  fallbackClassName,
}: EntityAvatarProps) {
  const initial = (displayInitial ?? name ?? "?").charAt(0).toUpperCase();

  return (
    <Avatar className={cn("h-12 w-12", className)}>
      {imageUrl ? <AvatarImage src={imageUrl} alt={name} /> : null}
      <AvatarFallback
        className={cn(
          "bg-primary/10 text-primary text-lg font-semibold",
          fallbackClassName,
        )}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
