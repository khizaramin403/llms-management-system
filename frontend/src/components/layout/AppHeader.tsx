"use client";

import { useSyncExternalStore } from "react";
import { LogOut, Palette as PaletteIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import { ThemeToggle } from "./ThemeToggle";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/features/auth/hooks";
import { getPalette, setPalette, type Palette } from "@/lib/palette";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function subscribeToPalette(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("palette-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("palette-change", callback);
    window.removeEventListener("storage", callback);
  };
}

/**
 * Re-render reasoning:
 * 1. AppHeader is a client boundary subscribing narrowly to current user info.
 * 2. Sticky 56px layout matching DESIGN.md Section 5 (SidebarTrigger, Breadcrumbs, spacer, ThemeToggle, avatar dropdown).
 * 3. Logout action invokes useLogout mutation.
 */
export function AppHeader() {
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();

  const currentPalette = useSyncExternalStore(
    subscribeToPalette,
    getPalette,
    () => "navy" as Palette
  );

  const handlePaletteChange = (palette: Palette) => {
    setPalette(palette);
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <SidebarTrigger className="cursor-pointer" aria-label="Toggle sidebar" />
      <Breadcrumbs />

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center rounded-full outline-hidden ring-sidebar-ring focus-visible:ring-2 cursor-pointer"
              aria-label="User account menu"
            >
              <UserAvatar name={user.name} size="md" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-lg bg-popover text-popover-foreground shadow-lg"
              sideOffset={6}
            >
              <DropdownMenuLabel className="p-2 font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <div className="mt-2">
                  <RoleBadge role={user.role} />
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Palette selection submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <PaletteIcon className="mr-2 size-4" />
                  <span>Palette</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-36">
                  <DropdownMenuRadioGroup
                    value={currentPalette}
                    onValueChange={(val) => handlePaletteChange(val as Palette)}
                  >
                    <DropdownMenuRadioItem value="navy" className="cursor-pointer">
                      Navy
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="cream" className="cursor-pointer">
                      Cream
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 size-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
