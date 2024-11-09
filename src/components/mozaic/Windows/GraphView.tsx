import { useEffect, useState } from "react";
import { ApiAction, useApi } from "@/context/apiContext.tsx";
import { useRefresh } from "@/context/RefreshContext.tsx";
import { StatusPageData } from "@/interfaces/statusPageData.interface.ts";
import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart.tsx";

const statusToColor = {
    operational: "hsl(var(--chart-1))",
    degraded_performance: "hsl(var(--chart-2))",
    partial_outage: "hsl(var(--chart-3))",
    major_outage: "hsl(var(--chart-4))"
};

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "#2563eb"
    },
    mobile: {
        label: "Mobile",
        color: "#60a5fa"
    }
} satisfies ChartConfig;

interface GraphViewProps {
    api: string;
    additionalSettings?: Record<string, any>;
    dimensions?: { width: number; height: number };
}

export const GraphView = ({ api, dimensions }: GraphViewProps) => {
    const [data, setData] = useState<StatusPageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { fetchStatusPageData } = useApi();
    const { refreshSignal } = useRefresh();

    // Calculate dimensions for the current tile
    const width = dimensions?.width || 1;
    const height = dimensions?.height || 1;
    const outerRadius = Math.min(width, height) * 0.4;

    useEffect(() => {
        const loadData = async () => {
            if (api === "/api/summary" || !api || api.trim() === "") return;

            try {
                setIsLoading(true);
                const fetchedData = await fetchStatusPageData(api, ApiAction.Components);
                setData(fetchedData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [api, fetchStatusPageData, refreshSignal]);

    if (!data || isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <span className="text-gray-500">Loading...</span>
            </div>
        );
    }

    const chartData = Object.entries(
        data.components.reduce((acc, component) => {
            acc[component.status] = (acc[component.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).map(([status, count]) => ({
        name: status.replace("_", " "),
        value: count,
        color: statusToColor[status as keyof typeof statusToColor]
    }));

    return (
        <ChartContainer config={chartConfig} style={{height, width}}>
            <div style={{ width, height }} className="flex items-center justify-center ">
                <PieChart width={width} height={height}>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={outerRadius}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 60).toFixed(0)}%`}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">Status</span>
                                                <span className="font-bold text-muted-foreground">{data.name}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">Count</span>
                                                <span className="font-bold">{data.value}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Legend />
                </PieChart>
            </div>
        </ChartContainer>
    );
};