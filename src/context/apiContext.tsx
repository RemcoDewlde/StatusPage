import { ApiAction } from "../enums/apiActions.enum.ts";
import { createContext, ReactNode, useCallback, useContext } from "react";
import { invoke } from "@tauri-apps/api/tauri";

interface ApiContextType {
    fetchStatusPageData: (pageId: string, action: ApiAction) => Promise<ApiResponse>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const fetchStatusPageData = useCallback(async (pageId: string, action: ApiAction): Promise<ApiResponse> => {
        try {
            return await invoke<ApiResponse>("fetch_statuspage_data", { page_id: pageId, action });
        } catch (error) {
            console.error("Error fetching data:", error);
            throw error;
        }
    }, []);

    return (
        <ApiContext.Provider value={{ fetchStatusPageData }}>
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
