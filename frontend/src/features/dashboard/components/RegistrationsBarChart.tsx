"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartCard } from "@/components/shared/ChartCard";
import { formatDate } from "@/lib/format";

export interface RegistrationsBarChartProps {
  data?: Array<{ date: string; count: number }>;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  className?: string;
}

const chartConfig: ChartConfig = {
  count: {
    label: "Registrations",
    color: "var(--color-chart-1)",
  },
};

/**
 * Re-render reasoning:
 * Memoized to prevent re-rendering Recharts SVG elements on unrelated page updates.
 * Adheres to DESIGN.md Section 6:
 * - Rounded top corners (radius 4)
 * - Thin horizontal grid lines only, no vertical grid
 * - 12px muted axis labels
 * - shadcn ChartTooltip
 * - Fixed height 280px
 */
export const RegistrationsBarChart = React.memo(
  function RegistrationsBarChart({
    data = [],
    isLoading = false,
    isError = false,
    onRetry,
    className,
  }: RegistrationsBarChartProps) {
    const isEmpty =
      !isLoading &&
      (!data || data.length === 0 || data.every((d) => d.count === 0));

    const formattedData = React.useMemo(() => {
      return data.map((item) => ({
        ...item,
        displayDate: formatDate(item.date, "EEE, MMM d"),
        shortDate: formatDate(item.date, "EEE"),
      }));
    }, [data]);

    return (
      <ChartCard
        title="Registrations"
        description="Patient registrations over the last 7 days"
        period="Last 7 days"
        isLoading={isLoading}
        isEmpty={isEmpty}
        emptyTitle="No registrations"
        emptyDescription="No patient registrations recorded in the last 7 days."
        isError={isError}
        onRetry={onRetry}
        height={280}
        className={className}
      >
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-border/40"
            />
            <XAxis
              dataKey="shortDate"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs text-muted-foreground select-none"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDecimals={false}
              className="text-xs text-muted-foreground select-none"
            />
            <ChartTooltip
              cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
              content={
                <ChartTooltipContent
                  labelKey="count"
                  labelFormatter={(_val, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.displayDate || "";
                  }}
                />
              }
            />
            <Bar
              dataKey="count"
              fill="var(--color-chart-1)"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ChartContainer>
      </ChartCard>
    );
  }
);
