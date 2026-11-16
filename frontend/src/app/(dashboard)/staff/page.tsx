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
import { useUsers } from "@/features/users/hooks";
import { UsersTable } from "@/features/users/components/UsersTable";

/**
 * Re-render reasoning:
 * 1. StaffContent isolates URL state subscriptions (useTableParams) and TanStack Query (useUsers).
 * 2. Scope "lab" omits the organization column since all staff belong to the current laboratory.
 * 3. Search and role filters trigger shallow URL state updates and preserve previous data during fetch.
 */
function StaffContent() {
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
      role: parseAsString.withDefault(""),
    },
  });

  const role = (filters.role as string) || "";
  const hasActiveFilters = Boolean(search || role);

  // Staff query automatically scoped to lab admin's tenant on the backend
  const { data, isLoading, isFetching, isError, refetch } = useUsers({
    page,
    limit,
    search: search || undefined,
    role: role || undefined,
    sort: sort || undefined,
  });

  const staff = data?.data ?? [];
  const meta = data?.meta ?? {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Staff"
        description="Manage doctors and receptionists for your laboratory"
        actions={
          <Button className="gap-2">
            <Plus className="size-4" />
            Add staff
          </Button>
        }
      />

      {/* Search and Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SearchInput
            value={search}
            onSearch={setSearch}
            placeholder="Search staff by name or email..."
            isFetching={isFetching}
            className="w-full sm:max-w-xs"
          />

          <Select
            value={role || "ALL"}
            onValueChange={(val) => {
              setFilter("role", val === "ALL" ? "" : val);
            }}
          >
            <SelectTrigger
              className="w-full sm:w-[160px] h-9 text-sm"
              aria-label="Filter by role"
            >
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All roles</SelectItem>
              <SelectItem value={ROLES.DOCTOR}>Doctor</SelectItem>
              <SelectItem value={ROLES.RECEPTIONIST}>Receptionist</SelectItem>
              <SelectItem value={ROLES.LAB_ADMIN}>Lab Admin</SelectItem>
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

      {/* Staff Data Table */}
      <UsersTable
        scope="lab"
        data={staff}
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
              title="No matching staff"
              description="No staff members matched your search or role filters."
              action={
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              variant="no-data"
              title="No staff found"
              description="No staff accounts have been added to your laboratory yet."
              action={
                <Button size="sm" className="gap-2">
                  <Plus className="size-4" />
                  Add staff
                </Button>
              }
            />
          )
        }
      />
    </div>
  );
}

export default function StaffPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.LAB_ADMIN]}>
      <Suspense fallback={<TableSkeleton rowCount={5} columnCount={5} />}>
        <StaffContent />
      </Suspense>
    </RoleGuard>
  );
}
