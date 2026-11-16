"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { formatDate } from "@/lib/format";
import type { Lab } from "../types";

/**
 * Re-render reasoning:
 * Column definitions are declared as a static constant outside of any React component
 * to ensure referential stability and prevent TanStack Table from re-calculating header/cell
 * models on parent re-renders.
 */
export const labColumns: ColumnDef<Lab>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    cell: ({ row }) => {
      const lab = row.original;
      return (
        <div className="flex items-center gap-3">
          <UserAvatar name={lab.name} size="sm" />
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-foreground truncate">
              {lab.name}
            </span>
            {lab.slug && (
              <span className="text-xs text-muted-foreground truncate">
                {lab.slug}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "contactEmail",
    header: "Contact Email",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-muted-foreground truncate">
        {row.original.contactEmail || "-"}
      </span>
    ),
  },
  {
    accessorKey: "contactPhone",
    header: "Phone",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums truncate">
        {row.original.contactPhone || "-"}
      </span>
    ),
  },
  {
    accessorKey: "userCount",
    header: "Users",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="tabular-nums font-medium text-foreground">
        {row.original.userCount ?? 0}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums whitespace-nowrap">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    enableSorting: false,
    cell: () => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center justify-center rounded-md size-8 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer transition-colors"
            aria-label="Actions menu"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem disabled>View details</DropdownMenuItem>
            <DropdownMenuItem disabled>Edit lab</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled
              className="text-destructive focus:text-destructive"
            >
              Deactivate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
