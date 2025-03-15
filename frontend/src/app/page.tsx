"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { useEffect, useState } from "react"
import { getRFQsByStatus } from "@/lib/api"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export default function Page() {
  const [chartData, setChartData] = useState<{ status: string; count: number }[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getRFQsByStatus();
        // Count items by status
        const statusCounts = data.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        // Convert to array format needed for chart
        setChartData(Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count
        })));
      } catch (error) {
        console.error("Error fetching RFQs by status:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>RFQs by Status</CardTitle>
        <CardDescription>Showing RFQs by status for the current period</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="status"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar
              dataKey="count"
              fill="var(--color-desktop)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
