import React from "react";
import { PieChartComponent } from "@/components/mozaic/Windows/Graphs/Pie.tsx";
import { BarChartComponent } from "@/components/mozaic/Windows/Graphs/Bar.tsx";

interface GraphFactoryProps {
    chartType: string;
    data: any[];
    dimensions: { width: number; height: number };
    total?: number;
}

export const GraphFactory: React.FC<GraphFactoryProps> = ({ chartType, data, dimensions, total }) => {
    const { width, height } = dimensions;

    switch (chartType) {
        case "pie":
            return <PieChartComponent data={data} width={width} height={height} total={total} />;
        case "bar":
            return <BarChartComponent data={data} width={width} height={height} />;
        default:
            return <div>Unsupported Chart Type</div>;
    }
};
