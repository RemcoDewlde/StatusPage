import { GraphView } from '@/components/mozaic/Windows/GraphView.tsx';
import { DetailsView } from '@/components/mozaic/Windows/DetailsView.tsx';
import { SummaryView } from '@/components/mozaic/Windows/SummaryView.tsx';
import { FC, ReactNode } from 'react';
import { DevView } from '@/components/mozaic/Windows/DevView.tsx';
import { WelcomeView } from '@/components/mozaic/Windows/WelcomeScreen.tsx';

interface FactoryProps {
    viewType: string;
    api: string;
    additionalSettings?: Record<string, any>;
    dimensions: { width: number; height: number };
    needsConfig?: boolean;
    tileId?: string;
}

const ContentComponentFactory: FC<FactoryProps> = ({ viewType, api, additionalSettings, dimensions, needsConfig, tileId }) => {
    const componentsMap: Record<string, ReactNode> = {
        summary: <SummaryView api={api} additionalSettings={additionalSettings} needsConfig={needsConfig} tileId={tileId} />,
        details: <DetailsView api={api} needsConfig={needsConfig} tileId={tileId} />,
        graph: <GraphView api={api} additionalSettings={additionalSettings} dimensions={dimensions} needsConfig={needsConfig} tileId={tileId} />,
        dev: <DevView />,
        welcome: <WelcomeView />
    };

    return componentsMap[viewType];
};

export default ContentComponentFactory;
