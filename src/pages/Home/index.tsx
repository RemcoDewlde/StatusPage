import { ApiAction, useApi } from "../../context/apiContext.tsx";
import { useEffect } from "react";

const Home = () => {
    const { fetchStatusPageData } = useApi();
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

    return (
        <div>
            <h1>Home</h1>
            this is a home test
        </div>
    );
};
export default Home;