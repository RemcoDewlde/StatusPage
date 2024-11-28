import { useEffect, useMemo, useState } from "react";
import { ApiAction, useApi } from "@/context/apiContext.tsx";
import { useRefresh } from "@/context/RefreshContext.tsx";
import { StatusPageData } from "@/interfaces/statusPageData.interface.ts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart.tsx";
import { GraphFactory } from "@/components/mozaic/Windows/Graphs/GraphFactory.tsx";

const statusToColor: Record<string, string> = {
    operational: "hsl(var(--chart-1))",
    degraded_performance: "hsl(var(--chart-2))",
    partial_outage: "hsl(var(--chart-3))",
    major_outage: "hsl(var(--chart-4))"
};

const chartConfig = {
    operational: {
        label: "Operational",
        color: "hsl(var(--chart-1))"
    },
    degraded_performance: {
        label: "Degraded Performance",
        color: "hsl(var(--chart-2))"
    },
    partial_outage: {
        label: "Partial Outage",
        color: "hsl(var(--chart-3))"
    },
    major_outage: {
        label: "Major Outage",
        color: "hsl(var(--chart-4))"
    }
} satisfies ChartConfig;

interface GraphViewProps {
    api: string;
    additionalSettings?: Record<string, any>;
    dimensions?: { width: number; height: number };
}

export const GraphView = ({ api, additionalSettings, dimensions }: GraphViewProps) => {
    const [data, setData] = useState<StatusPageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { fetchStatusPageData } = useApi();
    const { refreshSignal } = useRefresh();

    const width = (dimensions?.width || 1) - 40;
    const height = (dimensions?.height || 1) - 40;

    useEffect(() => {
        const loadData = async () => {
            if (!api || api.trim() === "" || api === "/api/summary") return;

            setIsLoading(true);
            try {
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

    const chartData = useMemo(() => {
        if (!data) return [];
        return Object.entries(
            data.components.reduce((acc, component) => {
                acc[component.status] = (acc[component.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        ).map(([status, count]) => ({
            name: status.replace("_", " "),
            value: count,
            color: statusToColor[status] || "hsl(var(--muted))"
        }));
    }, [data]);

    const totalApis = useMemo(() => chartData.reduce((acc, { value }) => acc + value, 0), [chartData]);

    if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <span className="text-gray-500">Loading...</span>
            </div>
        );
    }

    return (
        <ChartContainer config={chartConfig} style={{ height, width }}>
            <GraphFactory
                chartType={additionalSettings?.chartType || "pie"}
                data={chartData}
                dimensions={{ width, height }}
                total={additionalSettings?.chartType === "pie" ? totalApis : undefined}
            />
        </ChartContainer>
    );
};
