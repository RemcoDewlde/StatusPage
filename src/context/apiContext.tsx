import { ApiAction } from '../enums/apiActions.enum.ts';
import {
    createContext,
    FunctionComponent,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import { invoke } from '@tauri-apps/api/core';
import { StatusPageData } from '../interfaces/statusPageData.interface.ts';
import { useApiSettingsStore } from '../store/apiSettingsStore';

interface ApiContextType {
    fetchStatusPageData: (pageId: string, action: ApiAction) => Promise<StatusPageData>;
    parseStringAndGetData: (inputString: string) => StatusPageData | null;
    statusPageData: StatusPageData | null;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

const ApiProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {

    const [statusPageData, setStatusPageData] = useState<StatusPageData | null>(null);

    const fetchStatusPageDataById = useCallback(async (page_id: string, action: ApiAction): Promise<StatusPageData> => {
        try {
            const pageSetting = useApiSettingsStore.getState().getSettingById(page_id);
            const invokeArgs: Record<string, any> = {
                pageId: page_id,
                action: action.toString(),
                isCustomDomain:  pageSetting?.isCustomDomain ?? false,
            };
            const data = await invoke<StatusPageData>('fetch_statuspage_data', invokeArgs);
            setStatusPageData(data);
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }, []);

    // TODO: rename this function to something more meaningful
    const parseStringAndGetData = useCallback((inputString: string): StatusPageData | null => {
        if (!statusPageData) {
            return null;
        }
        const filteredServices = statusPageData.components?.filter(component => component.name.includes(inputString));

        return {
            ...statusPageData,
            components: filteredServices,
        };
    }, [statusPageData]);

    const value = useMemo(() => ({
        fetchStatusPageData: fetchStatusPageDataById,
        parseStringAndGetData,
        statusPageData,
    }), [fetchStatusPageDataById, parseStringAndGetData, statusPageData]);

    return (
        <ApiContext.Provider value={value}>
            {children}
        </ApiContext.Provider>
    );
};

const useApi = (): ApiContextType => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
};

export { ApiProvider, useApi, ApiAction };
