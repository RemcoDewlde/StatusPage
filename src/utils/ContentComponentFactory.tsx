import { GraphView } from '@/components/mozaic/Windows/GraphView.tsx';
import { DetailsView } from '@/components/mozaic/Windows/DetailsView.tsx';
import { SummaryView } from '@/components/mozaic/Windows/SummaryView.tsx';
import { FC, ReactNode } from 'react';
import { DevView } from '@/components/mozaic/Windows/DevView.tsx';

interface FactoryProps {
    viewType: string;
    api: string;
    additionalSettings?: Record<string, any>;
}

const ContentComponentFactory: FC<FactoryProps> = ({ viewType, api, additionalSettings }) => {
    const componentsMap: Record<string, ReactNode> = {
        summary: <SummaryView api={api} />,
        details: <DetailsView api={api} />,
        graph: <GraphView api={api} additionalSettings={additionalSettings} />,
        dev: <DevView api={api} />,
    };

    return componentsMap[viewType];
};

export default ContentComponentFactory;
