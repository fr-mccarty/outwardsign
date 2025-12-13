"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface DataTableEmptyProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function DataTableEmpty({
  icon = <FileText className="h-12 w-12 text-muted-foreground" />,
  title,
  description,
  action,
  className,
}: DataTableEmptyProps) {
  const t = useTranslations('common')

  const displayTitle = title || t('noData')
  const displayDescription = description || t('noItemsFound')
  return (
    <div className={cn("text-center py-12", className)}>
      {icon && <div className="mx-auto mb-4 flex justify-center">{icon}</div>}
      {displayTitle && (
        <p className="text-lg font-medium text-foreground">
          {displayTitle}
        </p>
      )}
      {displayDescription && (
        <p className="mt-1 text-muted-foreground">{displayDescription}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}