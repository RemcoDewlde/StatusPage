import { ApiAction } from "../enums/apiActions.enum.ts";
import { createContext, FunctionComponent, ReactNode, useCallback, useContext, useMemo } from "react";
import { invoke } from "@tauri-apps/api/tauri";

interface ApiContextType {
    fetchStatusPageData: (pageId: string, action: ApiAction) => Promise<ApiResponse>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

const ApiProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
    const fetchStatusPageData = useCallback(async (page_id: string, action: ApiAction): Promise<ApiResponse> => {
        try {
            return await invoke<ApiResponse>('fetch_statuspage_data', { pageId: page_id, action: action.toString() });
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }, []);

    const value = useMemo(() => ({ fetchStatusPageData }), [fetchStatusPageData]);

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