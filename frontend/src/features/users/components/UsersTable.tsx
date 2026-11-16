"use client";

import * as React from "react";
import { type SortingState, type OnChangeFn } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/DataTable";
import { getUserColumns } from "./UserColumns";
import type { User, UserScope } from "../types";

export interface UsersTableProps {
  data: User[];
  scope?: UserScope;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  pagination?: React.ReactNode;
  emptyState?: React.ReactNode;
  onEdit?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
}

/**
 * Re-render reasoning:
 * UsersTable memoizes columns based on scope and action callbacks.
 * Shared by both Super Admin Users page and Lab Admin Staff page.
 */
export function UsersTable({
  data,
  scope = "all",
  isLoading,
  isFetching,
  isError,
  onRetry,
  sorting,
  onSortingChange,
  pagination,
  emptyState,
  onEdit,
  onToggleStatus,
}: UsersTableProps) {
  const columns = React.useMemo(() => {
    return getUserColumns({ scope, onEdit, onToggleStatus });
  }, [scope, onEdit, onToggleStatus]);

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      onRetry={onRetry}
      sorting={sorting}
      onSortingChange={onSortingChange}
      pagination={pagination}
      emptyState={emptyState}
    />
  );
}
