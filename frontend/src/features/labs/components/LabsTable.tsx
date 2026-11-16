"use client";

import * as React from "react";
import { type SortingState, type OnChangeFn } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/DataTable";
import { labColumns } from "./LabColumns";
import type { Lab } from "../types";

export interface LabsTableProps {
  data: Lab[];
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  pagination?: React.ReactNode;
  emptyState?: React.ReactNode;
}

/**
 * Re-render reasoning:
 * LabsTable acts as a presentation boundary using stable labColumns.
 * Interactions with pagination or sorting update URL state upstream,
 * allowing this component to re-render with fresh data without re-mounting headers.
 */
export function LabsTable({
  data,
  isLoading,
  isFetching,
  isError,
  onRetry,
  sorting,
  onSortingChange,
  pagination,
  emptyState,
}: LabsTableProps) {
  return (
    <DataTable
      columns={labColumns}
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
