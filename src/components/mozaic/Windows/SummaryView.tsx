import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { ApiAction, useApi } from "@/context/apiContext.tsx";
import { StatusPageData } from "@/interfaces/statusPageData.interface.ts";
import { useRefresh } from "@/context/RefreshContext.tsx";
import StatusPageIcon from "@/utils/StatusIcon.tsx";
import { Component } from "@/interfaces/component.interface.ts";


const sortComponentsByGroup = (data: StatusPageData) => {
    const groups: { [key: string]: Component[] } = {};

    data.components.forEach((component) => {
        const groupId = component.group_id || "ungrouped"; // Handle components without a group by using "ungrouped"

        if (!groups[groupId]) {
            groups[groupId] = [];
        }
        groups[groupId].push(component);
    });

    return groups;
};

export const SummaryView = (props: { api: string }) => {
    const [data, setData] = useState<StatusPageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { fetchStatusPageData } = useApi();
    const { refreshSignal } = useRefresh();

    useEffect(() => {
        let pollingTimeout: NodeJS.Timeout;

        const loadData = async () => {
            if (props.api === "/api/summary" || !props.api || props.api.trim() === "") {
                pollingTimeout = setTimeout(loadData, 500);
                return;
            }

            try {
                setIsLoading(true);
                let data = await fetchStatusPageData(props.api, ApiAction.Components);

                let x = sortComponentsByGroup(data);
                console.log(x)

                // console.log(data)
                setData(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();

        return () => {
            if (pollingTimeout) {
                clearTimeout(pollingTimeout);
            }
        };
    }, [props.api, fetchStatusPageData, refreshSignal]);

    if (!data || isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <span className="text-gray-500">Loading...</span>
            </div>
        );
    }

    return (
        <div className="mt-2 flex-1 min-h-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{data.page.name}</h3>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Components</h4>
            <ScrollArea className="h-full">
                <ul className="divide-y divide-gray-200">
                    {data.components.map((component) => (
                        <li key={component.id} className="py-2 flex items-center justify-between">
                            <div className="flex items-center">
                                <StatusPageIcon status={component.status} />
                                <span className="ml-2 text-sm text-gray-900">{component.name}</span>
                            </div>
                            <span className="text-xs text-gray-500 capitalize">
                                {component.status.replace("_", " ")}
                            </span>
                        </li>
                    ))}
                </ul>
            </ScrollArea>
        </div>
    );
};

