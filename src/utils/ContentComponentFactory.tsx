import { GraphView } from "@/components/mozaic/Windows/GraphView.tsx";
import { DetailsView } from "@/components/mozaic/Windows/DetailsView.tsx";
import { SummaryView } from "@/components/mozaic/Windows/SummaryView.tsx";
import { FC, ReactNode } from "react";
import { DevView } from "@/components/mozaic/Windows/DevView.tsx";
import { WelcomeView } from "@/components/mozaic/Windows/WelcomeScreen.tsx";

interface FactoryProps {
    viewType: string;
    api: string;
    additionalSettings?: Record<string, any>;
    dimensions: { width: number; height: number };
}

const ContentComponentFactory: FC<FactoryProps> = ({ viewType, api, additionalSettings, dimensions }) => {
    const componentsMap: Record<string, ReactNode> = {
        summary: <SummaryView api={api} additionalSettings={additionalSettings} />,
        details: <DetailsView api={api} />,
        graph: <GraphView api={api} additionalSettings={additionalSettings} dimensions={dimensions} />,
        dev: <DevView api={api} />,
        welcome: <WelcomeView />
    };

    return componentsMap[viewType];
};

export default ContentComponentFactory;
