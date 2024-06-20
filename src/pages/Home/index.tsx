import { ApiAction, useApi } from "../../context/apiContext.tsx";
import { useEffect } from "react";
import { useToast } from "../../context/toastContext.tsx";

const Home = () => {
    const { fetchStatusPageData } = useApi();
    const { addToast } = useToast();

    const pageId = "vb7bjptc3shr";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchStatusPageData(pageId, ApiAction.Summary);
                console.log("Summary data:", data);
            } catch (error) {
                console.error("Error fetching summary:", error);
            }
        };

        fetchData();
    }, [fetchStatusPageData, pageId]);

    const handleClick = () => {
        addToast('This is a success message', 'success', true);
    };

    return (
        <div>
            <h1>Home</h1>
            this is a home test
            <button onClick={handleClick}>Show Toast</button>

        </div>
    );
};
export default Home;