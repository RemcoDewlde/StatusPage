import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode, FC
} from "react";
import { IntervalType } from "@/utils/types.ts";

interface RefreshContextProps {
    refreshInterval: number;
    setRefreshInterval: (interval: number) => Promise<void>;
    refreshSignal: number;
}

const RefreshContext = createContext<RefreshContextProps | undefined>(
    undefined
);

export const useRefresh = (): RefreshContextProps => {
    const context = useContext(RefreshContext);
    if (!context) {
        throw new Error('useRefresh must be used within a RefreshProvider');
    }
    return context;
};

interface RefreshProviderProps {
    children: ReactNode;
    initialInterval?: number;
}

export const RefreshProvider: FC<RefreshProviderProps> = ({
                                                                    children,
                                                                    initialInterval = 5,
                                                                }) => {
    const [refreshInterval, setRefreshIntervalState] = useState<number>(
        initialInterval
    );
    const [refreshSignal, setRefreshSignal] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchInterval = async () => {
            try {
                const intervalType = await IntervalType.load();
                const loadedInterval = intervalType ? intervalType.interval : initialInterval;
                setRefreshIntervalState(loadedInterval);
            } catch (error) {
                console.error('Error loading refresh interval:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInterval();
    }, [initialInterval]);

    const setRefreshInterval = async (interval: number) => {
        setRefreshIntervalState(interval);
        try {
            await IntervalType.save(new IntervalType(interval));
            setRefreshSignal((prev) => prev + 1);
        } catch (error) {
            console.error('Error saving refresh interval:', error);
        }
    };

    useEffect(() => {
        // Clear any existing interval
        if (intervalId) {
            clearInterval(intervalId);
            console.log('Cleared existing interval');
        }

        // Only set up polling if refreshInterval is greater than 0
        if (refreshInterval > 0) {
            const id = setInterval(() => {
                setRefreshSignal((prev) => {
                    console.log('Incrementing refreshSignal');
                    return prev + 1;
                });
            }, refreshInterval * 60 * 1000); // Convert minutes to milliseconds

            setIntervalId(id);
            console.log(`Set new interval: every ${refreshInterval} minutes`);
        } else {
            console.log('Automatic refreshing is disabled.');
        }

        // Cleanup function to clear interval on unmount or when refreshInterval changes
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
                console.log('Cleanup: Cleared interval on unmount or interval change');
            }
        };
    }, [refreshInterval]);

    if (isLoading) {
        return <div>Loading settings...</div>;
    }

    return (
        <RefreshContext.Provider
            value={{ refreshInterval, refreshSignal, setRefreshInterval }}
        >
            {children}
        </RefreshContext.Provider>
    );
};
