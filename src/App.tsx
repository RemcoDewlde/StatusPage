import "./App.css";
import Layout from "./components/layout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import { useEffect } from "react";
import checkForUpdates from "./utils/updater.ts";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "settings",
                element: <Settings />
            }
        ]
    }
]);

const App = () => {

    useEffect(() => {
        checkForUpdates();
    }, []);


    return (
        <RouterProvider router={router} />
    );
};

export default App;
