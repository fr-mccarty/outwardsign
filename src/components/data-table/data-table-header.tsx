"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DataTableHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function DataTableHeader({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  actions,
  className,
}: DataTableHeaderProps) {
  const hasSearch = onSearchChange !== undefined;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-4 items-center justify-between",
        className
      )}
    >
      {hasSearch && (
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      )}
      {!hasSearch && <div className="flex-1" />}
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}