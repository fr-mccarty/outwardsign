"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface DataTableAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  separator?: boolean;
}

interface DataTableActionsProps {
  actions: DataTableAction[];
  variant?: "inline" | "dropdown";
  className?: string;
}

export function DataTableActions({
  actions,
  variant = "inline",
  className,
}: DataTableActionsProps) {
  const t = useTranslations('common')

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0", className)}>
            <span className="sr-only">{t('openMenu')}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action, index) => (
            <React.Fragment key={index}>
              {action.separator && index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={action.onClick}
                className={cn(
                  action.variant === "destructive" && "text-destructive focus:text-destructive",
                  action.className
                )}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "ghost"}
          size="sm"
          onClick={action.onClick}
          className={cn(
            action.variant === "destructive" && "text-destructive hover:text-destructive",
            action.className
          )}
        >
          {action.icon}
        </Button>
      ))}
    </div>
  );
}

interface DataTableRowActionsProps<T> {
  row: T;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  customActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    variant?: DataTableAction["variant"];
    className?: string;
  }>;
  variant?: "inline" | "dropdown" | "hybrid";
  className?: string;
}

export function DataTableRowActions<T>({
  row,
  onEdit,
  onDelete,
  customActions = [],
  variant = "inline",
  className,
}: DataTableRowActionsProps<T>) {
  const t = useTranslations('common')

  if (variant === "hybrid") {
    // For hybrid variant, only show dropdown with actions (no inline edit button)
    const dropdownActions: DataTableAction[] = [];

    if (customActions.length > 0) {
      customActions.forEach((action) => {
        dropdownActions.push({
          label: action.label,
          icon: action.icon,
          onClick: () => action.onClick(row),
          variant: action.variant,
          className: action.className,
        });
      });
    }

    if (onDelete) {
      dropdownActions.push({
        label: t('delete'),
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => onDelete(row),
        variant: "destructive",
        separator: dropdownActions.length > 0,
      });
    }

    return (
      <div className={cn("flex gap-2 items-center justify-center", className)}>
        {dropdownActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">{t('openMenu')}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {dropdownActions.map((action, index) => (
                <React.Fragment key={index}>
                  {action.separator && index > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={action.onClick}
                    className={cn(
                      action.variant === "destructive" && "text-destructive focus:text-destructive",
                      action.className
                    )}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  }

  // Original implementation for inline and dropdown variants
  const actions: DataTableAction[] = [];

  if (customActions.length > 0) {
    customActions.forEach((action) => {
      actions.push({
        label: action.label,
        icon: action.icon,
        onClick: () => action.onClick(row),
        variant: action.variant,
        className: action.className,
      });
    });
  }

  if (onEdit) {
    actions.push({
      label: t('edit'),
      icon: <Edit className="h-4 w-4" />,
      onClick: () => onEdit(row),
    });
  }

  if (onDelete) {
    actions.push({
      label: t('delete'),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(row),
      variant: "destructive",
      separator: actions.length > 0,
    });
  }

  return <DataTableActions actions={actions} variant={variant} className={className} />;
}