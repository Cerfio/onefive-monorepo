"use client";

import { Area, AreaChart, CartesianGrid, Label, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartLegendContent, ChartTooltipContent } from "@/components/application/charts/charts-base";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { cx } from "@/utils/cx";

interface LineChartProps {
  data: any[];
  title: string;
  dataKeys: {
    key: string;
    name: string;
    color: string;
    fill?: boolean;
  }[];
  xAxisKey: string;
  xAxisFormatter?: (value: any) => string;
  yAxisLabel?: string;
  className?: string;
}

export const CustomLineChart = ({ 
  data, 
  title: _title, 
  dataKeys, 
  xAxisKey, 
  xAxisFormatter,
  yAxisLabel = "Valeurs",
  className: _className 
}: LineChartProps) => {
  const isDesktop = useBreakpoint("lg");

  return (
    <div className="flex h-60 flex-col gap-2">
      <ResponsiveContainer className="h-full">
        <AreaChart
          data={data}
          className="text-tertiary [&_.recharts-text]:text-xs"
          margin={{
            top: isDesktop ? 12 : 6,
            bottom: isDesktop ? 16 : 0,
          }}
        >
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="currentColor" className="text-utility-brand-700" stopOpacity="0.7" />
              <stop offset="95%" stopColor="currentColor" className="text-utility-brand-700" stopOpacity="0" />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="currentColor" className="text-utility-gray-100" />

          <Legend
            align="right"
            verticalAlign="top"
            layout={isDesktop ? "vertical" : "horizontal"}
            content={<ChartLegendContent className="-translate-y-2" />}
          />

          <XAxis
            fill="currentColor"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            dataKey={xAxisKey}
            tickFormatter={xAxisFormatter || ((value) => value)}
            padding={{ left: 10, right: 10 }}
          >
            {isDesktop && (
              <Label fill="currentColor" className="!text-xs font-medium max-lg:hidden" position="bottom">
                {xAxisKey}
              </Label>
            )}
          </XAxis>

          <YAxis
            fill="currentColor"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            tickFormatter={(value) => Number(value).toLocaleString()}
          >
            <Label
              value={yAxisLabel}
              fill="currentColor"
              className="!text-xs font-medium"
              style={{ textAnchor: "middle" }}
              angle={-90}
              position="insideLeft"
            />
          </YAxis>

          <Tooltip
            content={<ChartTooltipContent />}
            formatter={(value) => Number(value).toLocaleString()}
            labelFormatter={xAxisFormatter || ((value) => value)}
            cursor={{
              className: "stroke-utility-brand-600 stroke-2",
            }}
          />

          {dataKeys.map((dataKey, index) => (
            <Area
              key={dataKey.key}
              isAnimationActive={false}
              className={cx(dataKey.color, "[&_.recharts-area-area]:translate-y-1.5 [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]")}
              dataKey={dataKey.key}
              name={dataKey.name}
              type="monotone"
              stroke="currentColor"
              strokeWidth={2}
              fill={dataKey.fill && index === 0 ? "url(#gradient)" : "none"}
              fillOpacity={dataKey.fill ? 0.1 : 0}
              activeDot={{
                className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
              }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
