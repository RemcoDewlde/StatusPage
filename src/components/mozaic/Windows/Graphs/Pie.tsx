import React from "react";
import { Cell, Label, Legend, Pie, PieChart, Tooltip } from "recharts";

interface PieChartComponentProps {
    data: any[];
    width: number;
    height: number;
    total?: number; // Optional total for center labels
}

export const PieChartComponent: React.FC<PieChartComponentProps> = ({ data, width, height, total }) => {
    const outerRadius = Math.min(width, height) * 0.4;

    return (
        <PieChart width={width} height={height}>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={outerRadius}
                dataKey="value"
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                {total !== undefined && (
                    <Label
                        content={({ viewBox }) => {
                            const vb = viewBox as { cx: number; cy: number };
                            if (vb?.cx && vb?.cy) {
                                return (
                                    <g>
                                        <circle
                                            cx={vb.cx}
                                            cy={vb.cy}
                                            r={Math.min(width, height) / 4}
                                            fill="white"
                                            className="stroke-border"
                                            strokeWidth={1}
                                        />
                                        <text
                                            x={vb.cx}
                                            y={vb.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                                x={vb.cx}
                                                y={vb.cy}
                                                className="fill-foreground text-3xl font-bold"
                                            >
                                                {total}
                                            </tspan>
                                            <tspan
                                                x={vb.cx}
                                                y={(vb.cy || 0) + 24}
                                                className="fill-muted-foreground text-lg"
                                            >
                                                Total
                                            </tspan>
                                        </text>
                                    </g>
                                );
                            }
                            return null;
                        }}
                        position="center"
                    />
                )}
            </Pie>
            <Tooltip />
            <Legend />
        </PieChart>
    );
};
