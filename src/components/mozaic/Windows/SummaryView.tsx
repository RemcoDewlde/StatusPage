import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { ApiAction, useApi } from "@/context/apiContext.tsx";
import { StatusPageData } from "@/interfaces/statusPageData.interface.ts";
import { useRefresh } from "@/context/RefreshContext.tsx";
import StatusPageIcon from "@/utils/StatusIcon.tsx";
import { Component } from "@/interfaces/component.interface.ts";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SummaryViewProps {
    api: string;
    additionalSettings?: Record<string, any>;
}

const sortComponentsByGroup = (data: StatusPageData) => {
    const groups: { [key: string]: Component[] } = {};

    data.components.forEach((component) => {
        const groupId = component.group_id ?? "ungrouped";

        if (!groups[groupId]) {
            groups[groupId] = [];
        }
        groups[groupId].push(component);
    });

    return groups;
};

export const SummaryView = ({ api, additionalSettings }: SummaryViewProps) => {
    const [data, setData] = useState<StatusPageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { fetchStatusPageData } = useApi();
    const { refreshSignal } = useRefresh();
    const [groupedComponents, setGroupedComponents] = useState<{ [key: string]: Component[]; }>({});
    const [groupMap, setGroupMap] = useState<{ [key: string]: Component }>({});

    const showOneGroup = additionalSettings?.showOneGroup;
    const groupId = additionalSettings?.groupId;
    const showInGroups = additionalSettings?.showInGroups;

    useEffect(() => {
        let pollingTimeout: NodeJS.Timeout;

        const loadData = async () => {
            if (api === "/api/summary" || !api || api.trim() === "") {
                pollingTimeout = setTimeout(loadData, 500);
                return;
            }

            try {
                setIsLoading(true);
                const data = await fetchStatusPageData(api, ApiAction.Components);
                setData(data);

                const newGroupMap: { [key: string]: Component } = {};
                data.components.forEach((component) => {
                    if (component.group && component.id) {
                        newGroupMap[component.id] = component;
                    }
                });
                setGroupMap(newGroupMap);

                // Group components
                const groups = sortComponentsByGroup(data);
                setGroupedComponents(groups);
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
    }, [api, fetchStatusPageData, refreshSignal]);

    if (!data || isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <span className="text-gray-500">Loading...</span>
            </div>
        );
    }

    return (
        <div className="mt-2 flex-1 min-h-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {data.page.name}
            </h3>
            {showInGroups ? (
                <ScrollArea className="h-full">
                    <Accordion type="multiple">
                        {Object.entries(groupedComponents).map(
                            ([groupId, components]) => (
                                <AccordionItem key={groupId} value={groupId}>
                                    <AccordionTrigger>
                                        {groupMap[groupId]?.name || "Ungrouped"}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="divide-y divide-gray-200">
                                            {components.map((component) => (
                                                <li
                                                    key={component.id}
                                                    className="py-2 flex items-center justify-between"
                                                >
                                                    <div className="flex items-center">
                                                        <StatusPageIcon status={component.status} />
                                                        <span className="ml-2 text-sm text-gray-900">
                                                                    {component.name}
                                                                </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500 capitalize">
                                                            {component.status.replace("_", " ")}
                                                        </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        )}
                    </Accordion>
                </ScrollArea>
            ) : showOneGroup && groupId ? (
                <>
                    <p>
                        {groupMap[groupId]?.name || "Ungrouped"}
                    </p>
                    <ScrollArea className="h-full">
                        <ul className="divide-y divide-gray-200">
                            {groupedComponents[groupId]?.map((component) => (
                                <li key={component.id} className="py-2 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <StatusPageIcon status={component.status} />
                                        <span className="ml-2 text-sm text-gray-900">
                                            {component.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500 capitalize">
                                        {component.status.replace("_", " ")}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                </>
            ) : (
                // Default rendering without grouping
                <ScrollArea className="h-full">
                    <ul className="divide-y divide-gray-200">
                        {data.components.map((component) => (
                            <li
                                key={component.id}
                                className="py-2 flex items-center justify-between"
                            >
                                <div className="flex items-center">
                                    <StatusPageIcon status={component.status} />
                                    <span className="ml-2 text-sm text-gray-900">
                    {component.name}
                  </span>
                                </div>
                                <span className="text-xs text-gray-500 capitalize">
                  {component.status.replace("_", " ")}
                </span>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            )}
        </div>
    );
};
