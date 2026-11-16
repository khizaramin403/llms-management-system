"use client";

import * as React from "react";
import { Suspense } from "react";
import { parseAsString } from "nuqs";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { ROLES } from "@/constants/roles";
import { useTableParams } from "@/hooks/use-table-params";
import { useLabs } from "@/features/labs/hooks";
import { LabsTable } from "@/features/labs/components/LabsTable";

/**
 * Re-render reasoning:
 * 1. LabsContent subscribes directly to URL search parameters using `useTableParams`.
 * 2. Search debouncing (300ms) and filter selects write to the URL shallowly,
 *    triggering only the table query without mounting/unmounting page-level layouts.
 * 3. `keepPreviousData` ensures no layout flicker during pagination or search transitions.
 */
function LabsContent() {
  const {
    page,
    limit,
    search,
    sort,
    filters,
    sorting,
    onSortingChange,
    setPage,
    setLimit,
    setSearch,
    setFilter,
    resetFilters,
  } = useTableParams({
    defaultLimit: 20,
    defaultSort: "-createdAt",
    extraParsers: {
      status: parseAsString.withDefault(""),
    },
  });

  const status = (filters.status as string) || "";
  const hasActiveFilters = Boolean(search || status);

  const { data, isLoading, isFetching, isError, refetch } = useLabs({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    sort: sort || undefined,
  });

  const labs = data?.data ?? [];
  const meta = data?.meta ?? {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SearchInput
            value={search}
            onSearch={setSearch}
            placeholder="Search labs by name..."
            isFetching={isFetching}
            className="w-full sm:max-w-xs"
          />

          <Select
            value={status || "ALL"}
            onValueChange={(val) => {
              setFilter("status", val === "ALL" ? "" : val);
            }}
          >
            <SelectTrigger
              className="w-full sm:w-[150px] h-9 text-sm"
              aria-label="Filter by status"
            >
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground self-start sm:self-center"
            >
              <X className="mr-1.5 size-3.5" />
              Reset filters
            </Button>
          )}
        </div>
      </div>

      {/* Labs Data Table */}
      <LabsTable
        data={labs}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        onRetry={() => refetch()}
        sorting={sorting}
        onSortingChange={onSortingChange}
        pagination={
          <DataTablePagination
            page={page}
            limit={limit}
            total={meta.total}
            onPageChange={setPage}
            onLimitChange={setLimit}
            disabled={isFetching}
          />
        }
        emptyState={
          hasActiveFilters ? (
            <EmptyState
              variant="no-results"
              title="No matching labs"
              description="No laboratories matched your search or status filters."
              action={
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              variant="no-data"
              title="No labs found"
              description="No diagnostic laboratories have been registered yet."
              action={
                <Button size="sm" disabled className="cursor-not-allowed">
                  <Plus className="mr-2 size-4" />
                  Add lab
                </Button>
              }
            />
          )
        }
      />
    </div>
  );
}

export default function LabsPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
      <div className="space-y-6">
        <PageHeader
          title="Labs"
          description="Manage laboratory organizations and administrative accounts"
          actions={
            <Button disabled className="cursor-not-allowed">
              <Plus className="mr-2 size-4" />
              Add lab
            </Button>
          }
        />
        <Suspense fallback={<TableSkeleton rowCount={5} columnCount={7} />}>
          <LabsContent />
        </Suspense>
      </div>
    </RoleGuard>
  );
}
