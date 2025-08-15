import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { useStatusPageStore } from '@/store/statusPageStore';
import { StatusPageData } from '@/interfaces/statusPageData.interface.ts';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import StatusPageIcon from '@/utils/StatusIcon.tsx';
import { Component } from '@/interfaces/component.interface.ts';
import { Button } from '@/components/ui/button.tsx';
import { useFormDialogStore } from '@/store/formDialogStore';

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

export const SummaryView = ({ api, additionalSettings, needsConfig, tileId }: any) => {
    const openDialog = useFormDialogStore(s => s.openDialog);
    const data = useStatusPageStore((state) => state.data[api] || null);
    const isLoading = useStatusPageStore((state) => state.isLoading[api] || false);
    const error = useStatusPageStore((state) => state.error[api] || null);
    const fetchStatusPage = useStatusPageStore((state) => state.fetchStatusPage);

    const [groupedComponents, setGroupedComponents] = useState<{ [key: string]: Component[] }>({});
    const [groupMap, setGroupMap] = useState<{ [key: string]: Component }>({});

    const showOneGroup = additionalSettings?.showOneGroup;
    const groupId = additionalSettings?.groupId;
    const showInGroups = additionalSettings?.showInGroups;

    useEffect(() => {
        if (needsConfig) return;
        if (!api || api === "/api/summary" || api.trim() === "") return;
        if (data) {
            // Group components
            const newGroupMap: { [key: string]: Component } = {};
            data.components.forEach((component) => {
                if (component.group && component.id) {
                    newGroupMap[component.id] = component;
                }
            });
            setGroupMap(newGroupMap);
            setGroupedComponents(sortComponentsByGroup(data));
        } else {
            // If no data, try to fetch it
            fetchStatusPage(api);
        }
    }, [api, data, fetchStatusPage, needsConfig]);

    if (needsConfig) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-base font-semibold mb-1">Configure summary tile</h3>
                    <p className="text-sm text-muted-foreground mb-3">Select an API and (optionally) grouping to continue.</p>
                    <div className="flex items-center justify-center gap-2">
                        {tileId && <Button size="sm" onClick={() => openDialog(tileId)}>Configure now</Button>}
                    </div>
                </div>
            </div>
        );
    }

    if (!data || isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <span className="text-gray-500">Loading...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <span className="text-red-500">{error}</span>
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
                                                        <span className="ml-2 text-sm text-gray-900">s
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
