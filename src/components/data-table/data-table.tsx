"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DataTableEmpty } from "./data-table-empty";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc" | null;

export interface DataTableColumn<T> {
  key: string;
  header: string | React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  hidden?: boolean;
  hiddenOn?: "sm" | "md" | "lg" | "xl";
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  accessorFn?: (row: T) => any;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyState?: {
    icon?: React.ReactNode;
    title?: string;
    description?: string;
    action?: React.ReactNode;
  };
  className?: string;
  containerClassName?: string;
  rowClassName?: string | ((row: T) => string);
  defaultSort?: {
    key: string;
    direction: SortDirection;
  };
  // Infinite scroll props
  onLoadMore?: () => void | Promise<void>;
  hasMore?: boolean;
  stickyHeader?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyState,
  className,
  containerClassName,
  rowClassName,
  defaultSort,
  onLoadMore,
  hasMore = false,
  stickyHeader = false,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  }>(defaultSort || { key: "", direction: null });

  // Infinite scroll hook
  const { sentinelRef, isLoading } = useInfiniteScroll({
    onLoadMore: onLoadMore || (() => {}),
    hasMore,
  });

  const visibleColumns = columns.filter((col) => !col.hidden);

  const getHiddenClass = (hiddenOn?: string) => {
    switch (hiddenOn) {
      case "sm":
        return "hidden sm:table-cell";
      case "md":
        return "hidden md:table-cell";
      case "lg":
        return "hidden lg:table-cell";
      case "xl":
        return "hidden xl:table-cell";
      default:
        return "";
    }
  };

  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;

    setSortConfig((current) => {
      if (current.key === column.key) {
        if (current.direction === "asc") {
          return { key: column.key, direction: "desc" };
        } else if (current.direction === "desc") {
          return { key: "", direction: null };
        }
      }
      return { key: column.key, direction: "asc" };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    const column = columns.find((col) => col.key === sortConfig.key);
    if (!column) return data;

    return [...data].sort((a, b) => {
      let compareValue = 0;

      if (column.sortFn) {
        compareValue = column.sortFn(a, b);
      } else if (column.accessorFn) {
        const aValue = column.accessorFn(a);
        const bValue = column.accessorFn(b);
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          compareValue = aValue.localeCompare(bValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          compareValue = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          compareValue = aValue.getTime() - bValue.getTime();
        } else {
          compareValue = String(aValue).localeCompare(String(bValue));
        }
      }

      return sortConfig.direction === "asc" ? compareValue : -compareValue;
    });
  }, [data, sortConfig, columns]);

  const getSortIcon = (column: DataTableColumn<T>) => {
    if (!column.sortable) return null;

    if (sortConfig.key !== column.key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }

    if (sortConfig.direction === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }

    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  if (data.length === 0) {
    return (
      <DataTableEmpty
        icon={emptyState?.icon}
        title={emptyState?.title}
        description={emptyState?.description}
        action={emptyState?.action}
      />
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-x-auto", containerClassName)}>
      <Table className={className}>
        <TableHeader
          className={cn(
            "border-b bg-muted/50",
            stickyHeader && "sticky top-0 z-10"
          )}
        >
          <TableRow>
            {visibleColumns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "font-medium",
                  getHiddenClass(column.hiddenOn),
                  column.headerClassName
                )}
              >
                {column.sortable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                    onClick={() => handleSort(column)}
                  >
                    {column.header}
                    {getSortIcon(column)}
                  </Button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row) => {
            const key = keyExtractor(row);
            const rowClassValue =
              typeof rowClassName === "function"
                ? rowClassName(row)
                : rowClassName;

            return (
              <TableRow
                key={key}
                className={cn(
                  "hover:bg-muted/25 transition-colors",
                  onRowClick && "cursor-pointer",
                  rowClassValue
                )}
                onClick={(e) => {
                  // Don't trigger row click if clicking on buttons or interactive elements
                  const target = e.target as HTMLElement;
                  if (target.closest('button') || target.closest('[role="menuitem"]')) {
                    return;
                  }
                  onRowClick?.(row);
                }}
              >
                {visibleColumns.map((column) => (
                  <TableCell
                    key={`${key}-${column.key}`}
                    className={cn(
                      getHiddenClass(column.hiddenOn),
                      column.className
                    )}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
          {/* Infinite scroll sentinel and loading indicator */}
          {onLoadMore && hasMore && (
            <TableRow>
              <TableCell
                colSpan={visibleColumns.length}
                className="h-24 text-center"
              >
                <div ref={sentinelRef} className="flex items-center justify-center">
                  {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading more...</span>
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}