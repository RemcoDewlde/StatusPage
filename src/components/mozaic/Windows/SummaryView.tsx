import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { ApiAction, useApi } from '@/context/apiContext.tsx';
import { StatusPageData } from '@/interfaces/statusPageData.interface.ts';

export const SummaryView = (props: { api: string }) => {
    const [data, setData] = useState<StatusPageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { fetchStatusPageData } = useApi();

    useEffect(() => {
        let pollingTimeout: NodeJS.Timeout;

        const loadData = async () => {
            if (props.api === '/api/summary' || !props.api || props.api.trim() === '') {
                console.warn('Waiting for the final API value:', props.api);

                pollingTimeout = setTimeout(loadData, 500);
                return;
            }

            try {
                setIsLoading(true);
                let data = await fetchStatusPageData(props.api, ApiAction.Components);
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
    }, [props.api, fetchStatusPageData]);

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case 'operational':
                return <CheckCircle className="text-green-500" />;
            case 'degraded_performance':
            case 'partial_outage':
                return <AlertCircle className="text-yellow-500" />;
            case 'major_outage':
                return <XCircle className="text-red-500" />;
            default:
                return null;
        }
    };

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
                                <StatusIcon status={component.status} />
                                <span className="ml-2 text-sm text-gray-900">{component.name}</span>
                            </div>
                            <span className="text-xs text-gray-500 capitalize">
                                        {component.status.replace('_', ' ')}
                                    </span>
                        </li>
                    ))}
                </ul>
            </ScrollArea>
        </div>
    );
};

