"use client";

import { useSyncExternalStore } from "react";
import { Palette as PaletteIcon, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getPalette,
  setPalette,
  subscribeToPalette,
  type Palette,
} from "@/lib/palette";

/**
 * Re-render reasoning:
 * PaletteSwitcher uses useSyncExternalStore to synchronize client-side
 * palette state safely with localStorage and custom 'palette-change' events.
 */
export function PaletteSwitcher() {
  const currentPalette = useSyncExternalStore(
    subscribeToPalette,
    getPalette,
    () => "navy" as Palette
  );

  const handlePaletteChange = (palette: Palette) => {
    setPalette(palette);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer transition-colors"
        aria-label="Select color palette"
        title={`Palette: ${currentPalette === "navy" ? "Navy (Default)" : "Cream"}`}
      >
        <PaletteIcon className="size-4" />
        <span className="sr-only">Toggle palette</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40" sideOffset={6}>
        <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
          Color Palette
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex cursor-pointer items-center justify-between"
          onClick={() => handlePaletteChange("navy")}
        >
          <div className="flex items-center gap-2">
            <span
              className="size-3 rounded-full border border-border bg-[#071739]"
              aria-hidden="true"
            />
            <span className="text-sm">Navy</span>
          </div>
          {currentPalette === "navy" && (
            <Check className="size-4 text-brand" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex cursor-pointer items-center justify-between"
          onClick={() => handlePaletteChange("cream")}
        >
          <div className="flex items-center gap-2">
            <span
              className="size-3 rounded-full border border-[#1E4035] bg-[#F4EDDC]"
              aria-hidden="true"
            />
            <span className="text-sm">Cream</span>
          </div>
          {currentPalette === "cream" && (
            <Check className="size-4 text-brand" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
