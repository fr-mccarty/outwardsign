"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ClearableSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Search input with search icon on left and clear button on right
 *
 * @param value - Current search value (controlled)
 * @param onChange - Callback when value changes
 * @param placeholder - Input placeholder text
 * @param className - Additional CSS classes
 *
 * @example
 * const [search, setSearch] = useState('');
 * <ClearableSearchInput
 *   value={search}
 *   onChange={setSearch}
 *   placeholder="Search..."
 * />
 */
export function ClearableSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: ClearableSearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      onChange("");
      e.currentTarget.blur();
    }
  };

  return (
    <div className={cn("relative p-1", className)}>
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
