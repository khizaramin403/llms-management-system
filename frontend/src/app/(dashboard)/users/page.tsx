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
import { useUsers } from "@/features/users/hooks";
import { UsersTable } from "@/features/users/components/UsersTable";

/**
 * Re-render reasoning:
 * 1. UsersContent isolates URL state subscriptions (useTableParams) and TanStack Query (useUsers).
 * 2. Filter changes immediately write to URL query params and trigger shallow updates.
 * 3. Scope "all" renders the full system-wide table including the Lab organization column.
 */
function UsersContent() {
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
      tenantId: parseAsString.withDefault(""),
    },
  });

  const role = (filters.role as string) || "";
  const tenantId = (filters.tenantId as string) || "";
  const hasActiveFilters = Boolean(search || role || tenantId);

  // Labs list for Super Admin tenant filter dropdown
  const { data: labsData } = useLabs({ limit: 100 });
  const labs = labsData?.data ?? [];

  // Users list query with keepPreviousData
  const { data, isLoading, isFetching, isError, refetch } = useUsers({
    page,
    limit,
    search: search || undefined,
    role: role || undefined,
    tenantId: tenantId || undefined,
    sort: sort || undefined,
  });

  const users = data?.data ?? [];
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
        title="Users"
        description="Manage system user accounts and platform access"
        actions={
          <Button className="gap-2">
            <Plus className="size-4" />
            Add user
          </Button>
        }
      />

      {/* Search and Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SearchInput
            value={search}
            onSearch={setSearch}
            placeholder="Search users by name or email..."
            isFetching={isFetching}
            className="w-full sm:max-w-xs"
          />

          <Select
            value={tenantId || "ALL"}
            onValueChange={(val) => {
              setFilter("tenantId", val === "ALL" ? "" : val);
            }}
          >
            <SelectTrigger
              className="w-full sm:w-[180px] h-9 text-sm"
              aria-label="Filter by lab"
            >
              <SelectValue placeholder="All labs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All labs</SelectItem>
              {labs.map((lab) => (
                <SelectItem key={lab.id} value={lab.id}>
                  {lab.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
              <SelectItem value={ROLES.SUPER_ADMIN}>Super Admin</SelectItem>
              <SelectItem value={ROLES.LAB_ADMIN}>Lab Admin</SelectItem>
              <SelectItem value={ROLES.DOCTOR}>Doctor</SelectItem>
              <SelectItem value={ROLES.RECEPTIONIST}>Receptionist</SelectItem>
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

      {/* Users Data Table */}
      <UsersTable
        scope="all"
        data={users}
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
              title="No matching users"
              description="No user accounts matched your search or filter criteria."
              action={
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              variant="no-data"
              title="No users found"
              description="No user accounts have been registered yet."
              action={
                <Button size="sm" className="gap-2">
                  <Plus className="size-4" />
                  Add user
                </Button>
              }
            />
          )
        }
      />
    </div>
  );
}

export default function UsersPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
      <Suspense fallback={<TableSkeleton rowCount={5} columnCount={6} />}>
        <UsersContent />
      </Suspense>
    </RoleGuard>
  );
}
