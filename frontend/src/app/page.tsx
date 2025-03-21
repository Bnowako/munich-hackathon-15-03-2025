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
  green: {
    label: "Green",
    color: "hsl(var(--chart-2))",
  },
  yellow: {
    label: "Yellow",
    color: "hsl(var(--chart-3))",
  },
  red: {
    label: "Red",
    color: "hsl(var(--chart-4))",
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
        // Define status order
        const statusOrder = ['open', 'in evaluation', 'closed'];

        // Count items by status
        const statusCounts = data.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Create array with all statuses, defaulting to 0 if no count exists
        setChartData(
          statusOrder.map(status => ({
            status,
            count: statusCounts[status] || 0,
            fill: status === 'open' ? 'var(--color-green)' : status === 'in evaluation' ? 'var(--color-yellow)' : 'var(--color-red)'
          }))
        );
      } catch (error) {
        console.error("Error fetching RFQs by status:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <h1 className="text-4xl font-bold mb-2">Welcome to TenderPilot</h1>
      <p className="text-xl text-muted-foreground mb-8">Here is the high level overview over relevant RFQs for you.</p>
      <div className="grid grid-cols-2 gap-4">
        <Card >
          <CardHeader>
            <CardTitle>RFQs by Status</CardTitle>
            <CardDescription>Showing RFQs with updates in the last 30 days</CardDescription>
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
          <CardFooter className="flex items-center text-sm text-muted-foreground">
            <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
            1 new RFQ added
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
