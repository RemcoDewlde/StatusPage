import { useEffect, useState } from 'react';
import { StatusPageData } from '@/interfaces/statusPageData.interface.ts';
import { ApiAction, useApi } from '@/context/apiContext.tsx';
import { useRefresh } from '@/context/RefreshContext.tsx';
import { Component } from '@/interfaces/component.interface.ts';

const sortComponentsByGroup = (data: StatusPageData) => {
    const groups: { [key: string]: Component[] } = {};

    data.components.forEach((component) => {
        const groupId = component.group_id || 'SectionName';

        if (!groups[groupId]) {
            groups[groupId] = [];
        }
        groups[groupId].push(component);
    });

    return groups;
};

export const DevView = (props: { api: string }) => {

    const [data, setData] = useState<StatusPageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { fetchStatusPageData } = useApi();
    const { refreshSignal } = useRefresh();

    useEffect(() => {
        let pollingTimeout: NodeJS.Timeout;

        const loadData = async () => {
            if (props.api === '/api/summary' || !props.api || props.api.trim() === '') {
                pollingTimeout = setTimeout(loadData, 500);
                return;
            }

            try {
                setIsLoading(true);
                let data = await fetchStatusPageData(props.api, ApiAction.Components);

                let x = sortComponentsByGroup(data);
                console.log(x);

                // console.log(data)
                setData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
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
        <div>
            <pre>
                <code>{JSON.stringify(sortComponentsByGroup(data), null, 2)}</code>
            </pre>
        </div>
    );
};
