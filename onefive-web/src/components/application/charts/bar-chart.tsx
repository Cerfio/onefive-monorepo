"use client";

import { Bar, CartesianGrid, Label, Legend, BarChart as RechartsBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartLegendContent, ChartTooltipContent } from "@/components/application/charts/charts-base";
import { useBreakpoint } from "@/hooks/use-breakpoint";

interface BarChartProps {
  data: any[];
  title: string;
  dataKeys: {
    key: string;
    name: string;
    color: string;
  }[];
  xAxisKey: string;
  xAxisFormatter?: (value: any) => string;
  yAxisLabel?: string;
  stackId?: string;
  className?: string;
}

export const CustomBarChart = ({ 
  data, 
  title: _title, 
  dataKeys, 
  xAxisKey, 
  xAxisFormatter,
  yAxisLabel = "Visiteurs",
  stackId = "a",
  className: _className 
}: BarChartProps) => {
  const isDesktop = useBreakpoint("lg");

  return (
    <ResponsiveContainer className="h-80" width="100%">
      <RechartsBarChart
        data={data}
        className="text-tertiary [&_.recharts-text]:text-xs"
        margin={{
          left: 4,
          right: 0,
          top: isDesktop ? 12 : 6,
          bottom: 18,
        }}
      >
        <CartesianGrid vertical={false} stroke="currentColor" className="text-utility-gray-100" />

        <Legend
          verticalAlign="top"
          align="right"
          layout={isDesktop ? "vertical" : "horizontal"}
          content={<ChartLegendContent className="-translate-y-2" />}
        />

        <XAxis
          fill="currentColor"
          axisLine={false}
          tickLine={false}
          tickMargin={11}
          interval="preserveStartEnd"
          dataKey={xAxisKey}
          tickFormatter={xAxisFormatter || ((value) => value)}
        >
          <Label value="Mois" fill="currentColor" className="!text-xs font-medium" position="bottom" />
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
            className: "fill-utility-gray-200/20",
          }}
        />

        {dataKeys.map((dataKey, index) => (
          <Bar
            key={dataKey.key}
            isAnimationActive={false}
            className={dataKey.color}
            dataKey={dataKey.key}
            name={dataKey.name}
            type="monotone"
            stackId={stackId}
            fill="currentColor"
            maxBarSize={isDesktop ? 32 : 16}
            radius={index === dataKeys.length - 1 ? [6, 6, 0, 0] : undefined}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};
