import { GraphView } from '@/components/mozaic/Windows/GraphView.tsx';
import { DetailsView } from '@/components/mozaic/Windows/DetailsView.tsx';
import { SummaryView } from '@/components/mozaic/Windows/SummaryView.tsx';
import { FC, ReactNode } from 'react';

interface FactoryProps {
    viewType: string;
    api: string;
}

const ContentComponentFactory: FC<FactoryProps> = ({ viewType, api }) => {
    const componentsMap: Record<string, ReactNode> = {
        summary: <SummaryView api={api} />,
        details: <DetailsView api={api} />,
        graph: <GraphView api={api} />,
    };

    return componentsMap[viewType];
};

export default ContentComponentFactory;