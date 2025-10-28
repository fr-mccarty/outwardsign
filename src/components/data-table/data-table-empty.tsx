"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableEmptyProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function DataTableEmpty({
  icon = <FileText className="h-12 w-12 text-gray-400" />,
  title = "No data",
  description = "No items found.",
  action,
  className,
}: DataTableEmptyProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      {icon && <div className="mx-auto mb-4 flex justify-center">{icon}</div>}
      {title && (
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {title}
        </p>
      )}
      {description && (
        <p className="mt-1 text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}