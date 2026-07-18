import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useFetchSuspiciousOrders } from "@/hooks/reports/usefetchsuspiciusorders";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, subDays } from "date-fns"; // Added subDays
import { Box } from "../ui/box";
import { useGenerateReportMutation } from "@/hooks/reports/usefetchstoreactivity";
import { Spinner } from "../ui/spinner";
import { Calendar1Icon } from "lucide-react";

const chartConfig = {
  count: {
    label: "Suspicious Orders",
    color: "hsl(221, 83%, 53%)",
  },
} as const;

export function SuspiciousOrdersReport() {
  const { mutate: generateReport, isPending: isDownloading } =
    useGenerateReportMutation();

  // FIX: Initialize with a default range (e.g., Last 30 Days)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data, isLoading, error } = useFetchSuspiciousOrders(
    dateRange?.from && dateRange?.to
      ? {
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      }
      : undefined
  );

  if (isLoading) return <div className="p-6 text-slate-500">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading data</div>;

  const chartData =
    data?.chartData?.map((d: any) => ({
      label: d.date,
      count: d.count,
    })) ?? [];

  const metrics = data?.metrics ?? {
    autoCancelled: 0,
    flaggedOrders: 0,
    preventedValue: 0,
    totalOrders: 0,
  };

  const handleDownloadReport = () => {
    const formattedDate = format(new Date(), "yyyy-MM-dd");
    generateReport(
      {
        url: "/reports/high-risk-csutomer-report/pdf",
        fileName: `High-Risk_Activity_Report_${formattedDate}.pdf`,
      },
      {
        onError: (error) => {
          console.error("Failed to download report:", error);
          alert(`Error: ${error.message}`);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Range */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Suspicious Orders Report</h2>
        <Box className="space-x-4">

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border border-gray-200 min-w-[240px] cursor-pointer  text-left font-normal"
              >

                <Calendar1Icon className="w-4 h-4 " />

                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d, yyyy")} -{" "}
                      {format(dateRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button
            className="bg-web-blue p-4 text-white"
            onClick={handleDownloadReport}
          >
            {isDownloading ? <Spinner /> : "Download Customer Activity"}
          </Button>
        </Box>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-1 shadow-xs border-gray-200">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{metrics.totalOrders}</p>
          </CardContent>
        </Card>
        <Card className="border-1 shadow-xs border-gray-200">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Flagged Orders</p>
            <p className="text-2xl font-bold">{metrics.flaggedOrders}</p>
          </CardContent>
        </Card>
        <Card className="border-1 shadow-xs border-gray-200">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Auto Cancelled</p>
            <p className="text-2xl font-bold">{metrics.autoCancelled}</p>
          </CardContent>
        </Card>
        <Card className="border-1 shadow-xs border-gray-200">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Prevented Value (£)</p>
            <p className="text-2xl font-bold">{metrics.preventedValue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Suspicious Orders Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-64 w-full !px-0 !mx-0">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-64 w-full flex items-center justify-center text-gray-400">
              No data available for this period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}